#!/usr/bin/env python3
"""Safe detector for CVE-2026-109618 and CVE-2026-109619.

This tool never sends exploit, OOM, multipart, malformed, origin-bypass, or
brute-force traffic.  It classifies exact PHP versions obtained locally,
provided by the operator, or passively disclosed over HTTP.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import ssl
import subprocess
import sys
import urllib.error
import urllib.parse
import urllib.request
from dataclasses import asdict, dataclass, field
from typing import Any


FIXED = {
    "8.2": "8.2.35",
    "8.3": "8.3.36",
    "8.4": "8.4.27",
    "8.5": "8.5.12",
}

CVES = {
    "CVE-2026-109618": "GHSA-w8hw-w9fx-j79w",
    "CVE-2026-109619": "GHSA-6wmf-4rv5-p3rp",
}

PHPINFO_PATHS = ("/phpinfo.php", "/info.php", "/phpinfo")
VERSION_RE = re.compile(r"(?i)PHP(?:\s+Version|/|\s+)\s*(\d+\.\d+\.\d+(?:[-+~.][0-9A-Za-z.+~-]+)?)")
PLAIN_VERSION_RE = re.compile(r"^(\d+)\.(\d+)\.(\d+)(.*)$")
MAX_BODY = 512 * 1024
USER_AGENT = "Kibernum-PHP2Shell-Safe-Scanner/1.0"


@dataclass
class Observation:
    mode: str
    target: str
    php_detected: bool = False
    version: str | None = None
    version_source: str | None = None
    sapi: str | None = None
    server: str | None = None
    upload_progress: str | None = None
    strict_mode: str | None = None
    memory_limit: str | None = None
    fatal_error_backtraces: str | None = None
    signals: list[str] = field(default_factory=list)
    exposed_phpinfo: list[str] = field(default_factory=list)
    errors: list[str] = field(default_factory=list)


def normalize_bool(value: str | None) -> bool | None:
    if value is None:
        return None
    normalized = str(value).strip().lower()
    if normalized in {"1", "on", "true", "yes", "enabled"}:
        return True
    if normalized in {"0", "off", "false", "no", "disabled", ""}:
        return False
    return None


def parse_version(version: str) -> tuple[tuple[int, int, int], str] | None:
    match = PLAIN_VERSION_RE.match(version.strip())
    if not match:
        return None
    numeric = tuple(int(match.group(i)) for i in range(1, 4))
    return numeric, match.group(4)


def classify_version(version: str | None) -> dict[str, Any]:
    if not version:
        return {
            "status": "INDETERMINATE",
            "vulnerable": None,
            "confidence": "LOW",
            "reason": "PHP may be present, but its exact version is unavailable.",
        }

    parsed = parse_version(version)
    if not parsed:
        return {
            "status": "INDETERMINATE",
            "vulnerable": None,
            "confidence": "LOW",
            "reason": f"Unrecognized PHP version format: {version}",
        }

    numeric, suffix = parsed
    major, minor, _ = numeric
    branch = f"{major}.{minor}"
    if major < 8 or (major == 8 and minor < 2):
        return {
            "status": "VULNERABLE_EOL",
            "vulnerable": True,
            "confidence": "HIGH" if not suffix else "MEDIUM",
            "branch": branch,
            "fixed_version": None,
            "reason": "Unsupported PHP branch with no upstream patched release for these advisories; migrate to a supported patched branch.",
        }

    if branch not in FIXED:
        return {
            "status": "INDETERMINATE_BRANCH",
            "vulnerable": None,
            "confidence": "LOW",
            "branch": branch,
            "fixed_version": None,
            "reason": "This PHP branch is outside the advisory table embedded in the scanner.",
        }

    fixed = parse_version(FIXED[branch])
    assert fixed is not None
    if numeric >= fixed[0]:
        return {
            "status": "NOT_VULNERABLE_BY_VERSION",
            "vulnerable": False,
            "confidence": "HIGH",
            "branch": branch,
            "fixed_version": FIXED[branch],
            "reason": "The observed PHP version is at or above the upstream fixed version.",
        }

    if suffix:
        return {
            "status": "REVIEW_VENDOR_BACKPORT",
            "vulnerable": None,
            "confidence": "MEDIUM",
            "branch": branch,
            "fixed_version": FIXED[branch],
            "reason": "The numeric version is below the upstream fix, but the vendor suffix may indicate a backported patch; verify the OS package changelog.",
        }

    return {
        "status": "VULNERABLE_BY_VERSION",
        "vulnerable": True,
        "confidence": "HIGH",
        "branch": branch,
        "fixed_version": FIXED[branch],
        "reason": "The observed upstream PHP version is below the fixed version.",
    }


def add_configuration_context(result: dict[str, Any], obs: Observation) -> None:
    reducers: list[str] = []
    warnings: list[str] = []

    if obs.memory_limit == "-1":
        reducers.append("memory_limit=-1 reduces the demonstrated CVE-2026-109618 path, but is not a complete mitigation.")
    if normalize_bool(obs.upload_progress) is False:
        reducers.append("session.upload_progress.enabled=Off blocks the demonstrated upload-progress path for CVE-2026-109619, but is not a complete mitigation.")
    if normalize_bool(obs.upload_progress) is True:
        warnings.append("Session upload progress is enabled; the demonstrated CVE-2026-109619 lifecycle path remains available on an affected version.")
    if obs.sapi == "cli":
        warnings.append("CLI configuration may differ from the PHP SAPI serving the website; validate FPM/Apache separately.")

    result["risk_reducers"] = reducers
    result["warnings"] = warnings
    result["configuration_changes_verdict"] = False


def local_observation(php_bin: str) -> Observation:
    obs = Observation(mode="local", target=php_bin)
    path = shutil.which(php_bin) if "/" not in php_bin else php_bin
    if not path:
        obs.errors.append(f"PHP binary not found: {php_bin}")
        return obs

    php_code = r'''
$v = [
  "version" => PHP_VERSION,
  "sapi" => php_sapi_name(),
  "upload_progress" => ini_get("session.upload_progress.enabled"),
  "strict_mode" => ini_get("session.use_strict_mode"),
  "memory_limit" => ini_get("memory_limit"),
  "fatal_error_backtraces" => ini_get("fatal_error_backtraces")
];
echo json_encode($v, JSON_UNESCAPED_SLASHES);
'''
    try:
        completed = subprocess.run(
            [path, "-r", php_code],
            capture_output=True,
            text=True,
            timeout=10,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        obs.errors.append(str(exc))
        return obs

    if completed.returncode != 0:
        obs.errors.append((completed.stderr or "PHP command failed").strip()[:500])
        return obs
    try:
        data = json.loads(completed.stdout)
    except json.JSONDecodeError as exc:
        obs.errors.append(f"Invalid JSON returned by PHP: {exc}")
        return obs

    obs.php_detected = True
    obs.version = data.get("version")
    obs.version_source = "local PHP runtime"
    obs.sapi = data.get("sapi")
    obs.upload_progress = data.get("upload_progress")
    obs.strict_mode = data.get("strict_mode")
    obs.memory_limit = data.get("memory_limit")
    obs.fatal_error_backtraces = data.get("fatal_error_backtraces")
    return obs


def version_observation(args: argparse.Namespace) -> Observation:
    obs = Observation(mode="supplied-version", target=args.version)
    obs.php_detected = True
    obs.version = args.version
    obs.version_source = "operator supplied"
    obs.sapi = args.sapi
    obs.upload_progress = args.upload_progress
    obs.strict_mode = args.strict_mode
    obs.memory_limit = args.memory_limit
    obs.fatal_error_backtraces = args.fatal_error_backtraces
    return obs


class ScopedRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Allow redirects only when the hostname remains exactly in scope."""

    def __init__(self, allowed_hostname: str):
        super().__init__()
        self.allowed_hostname = allowed_hostname.lower()

    def redirect_request(self, req, fp, code, msg, headers, newurl):
        hostname = urllib.parse.urlparse(newurl).hostname
        if not hostname or hostname.lower() != self.allowed_hostname:
            raise urllib.error.URLError(f"redirect outside authorized hostname blocked: {newurl}")
        return super().redirect_request(req, fp, code, msg, headers, newurl)


def make_opener(insecure: bool, allowed_hostname: str) -> urllib.request.OpenerDirector:
    context = ssl._create_unverified_context() if insecure else ssl.create_default_context()
    return urllib.request.build_opener(
        ScopedRedirectHandler(allowed_hostname),
        urllib.request.HTTPSHandler(context=context),
    )


def http_get(opener: urllib.request.OpenerDirector, url: str, timeout: float) -> dict[str, Any]:
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*;q=0.8"})
    try:
        with opener.open(request, timeout=timeout) as response:
            body = response.read(MAX_BODY)
            return {
                "url": response.geturl(),
                "status": response.status,
                "headers": dict(response.headers.items()),
                "body": body.decode("utf-8", errors="replace"),
            }
    except urllib.error.HTTPError as exc:
        body = exc.read(MAX_BODY).decode("utf-8", errors="replace")
        return {"url": url, "status": exc.code, "headers": dict(exc.headers.items()), "body": body}
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        return {"url": url, "error": str(exc)}


def extract_version(headers: dict[str, str], body: str) -> tuple[str | None, str | None]:
    powered = next((value for key, value in headers.items() if key.lower() == "x-powered-by"), "")
    match = VERSION_RE.search(powered)
    if match:
        return match.group(1), "HTTP X-Powered-By"

    if "phpinfo()" in body.lower() or "php version" in body.lower():
        match = VERSION_RE.search(body)
        if match:
            return match.group(1), "exposed phpinfo"
    return None, None


def remote_observation(url: str, phpinfo_paths: bool, insecure: bool, timeout: float) -> Observation:
    if not urllib.parse.urlparse(url).scheme:
        url = "https://" + url
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.hostname:
        return Observation(mode="remote", target=url, errors=["Target must be a valid HTTP or HTTPS URL."])

    base = f"{parsed.scheme}://{parsed.netloc}"
    obs = Observation(mode="remote", target=url)
    opener = make_opener(insecure, parsed.hostname)
    paths = [parsed.path or "/"]
    if phpinfo_paths:
        paths.extend(path for path in PHPINFO_PATHS if path not in paths)

    for path in paths:
        current = urllib.parse.urljoin(base + "/", path.lstrip("/"))
        response = http_get(opener, current, timeout)
        if response.get("error"):
            obs.errors.append(f"{current}: {response['error']}")
            continue
        headers = response["headers"]
        body = response["body"]
        server = next((value for key, value in headers.items() if key.lower() == "server"), None)
        if server and not obs.server:
            obs.server = server

        version, source = extract_version(headers, body)
        if version and not obs.version:
            obs.version = version
            obs.version_source = f"{source} at {response['url']}"
            obs.php_detected = True

        powered = next((value for key, value in headers.items() if key.lower() == "x-powered-by"), "")
        cookies = next((value for key, value in headers.items() if key.lower() == "set-cookie"), "")
        if "php" in powered.lower():
            obs.php_detected = True
            obs.signals.append("header:X-Powered-By")
        if "PHPSESSID" in cookies:
            obs.php_detected = True
            obs.signals.append("cookie:PHPSESSID")
        if "wp-content" in body.lower():
            obs.php_detected = True
            obs.signals.append("body:wp-content")
        if "phpinfo()" in body.lower() and "php version" in body.lower():
            obs.exposed_phpinfo.append(response["url"])

    obs.signals = sorted(set(obs.signals))
    obs.exposed_phpinfo = sorted(set(obs.exposed_phpinfo))
    return obs


def build_result(obs: Observation) -> dict[str, Any]:
    result: dict[str, Any] = {
        "scanner": "Kibernum PHP2Shell Safe Scanner 1.0",
        "non_destructive": True,
        "observation": asdict(obs),
        "assessment": classify_version(obs.version),
        "cves": CVES,
    }
    if not obs.php_detected and not obs.version and not obs.errors:
        result["assessment"] = {
            "status": "NO_PHP_DETECTED",
            "vulnerable": None,
            "confidence": "LOW",
            "reason": "No passive PHP signal was observed; this does not prove PHP is absent behind the frontend.",
        }
    if obs.errors and not obs.version:
        result["assessment"] = {
            "status": "ERROR",
            "vulnerable": None,
            "confidence": "NONE",
            "reason": "The scanner could not obtain enough evidence.",
        }
    add_configuration_context(result, obs)
    return result


def print_human(result: dict[str, Any]) -> None:
    obs = result["observation"]
    assessment = result["assessment"]
    print(f"Target:      {obs['target']}")
    print(f"Mode:        {obs['mode']}")
    print(f"PHP:         {obs['version'] or ('detected, version hidden' if obs['php_detected'] else 'not confirmed')}")
    if obs.get("version_source"):
        print(f"Source:      {obs['version_source']}")
    if obs.get("sapi"):
        print(f"SAPI:        {obs['sapi']}")
    print(f"Status:      {assessment['status']}")
    print(f"Vulnerable:  {assessment['vulnerable']}")
    print(f"Confidence:  {assessment['confidence']}")
    print(f"Reason:      {assessment['reason']}")
    for warning in result["warnings"]:
        print(f"Warning:     {warning}")
    for reducer in result["risk_reducers"]:
        print(f"Mitigation:  {reducer}")
    for error in obs["errors"]:
        print(f"Error:       {error}")


def exit_code(result: dict[str, Any]) -> int:
    vulnerable = result["assessment"]["vulnerable"]
    if vulnerable is True:
        return 1
    if vulnerable is False:
        return 0
    return 2


def main() -> int:
    parser = argparse.ArgumentParser(description="Non-destructive detector for CVE-2026-109618 and CVE-2026-109619")
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument("--local", action="store_true", help="inspect a local PHP CLI binary")
    source.add_argument("--version", help="classify an exact PHP version supplied by the operator")
    source.add_argument("--url", help="passively inspect one HTTP(S) target")
    parser.add_argument("--php-bin", default="php", help="PHP binary for --local (default: php)")
    parser.add_argument("--sapi", help="SAPI accompanying --version, e.g. fpm-fcgi or apache2handler")
    parser.add_argument("--upload-progress", help="session.upload_progress.enabled accompanying --version")
    parser.add_argument("--strict-mode", help="session.use_strict_mode accompanying --version")
    parser.add_argument("--memory-limit", help="memory_limit accompanying --version")
    parser.add_argument("--fatal-error-backtraces", help="fatal_error_backtraces accompanying --version")
    parser.add_argument("--phpinfo-paths", action="store_true", help="GET three common phpinfo paths; no POST or exploit traffic")
    parser.add_argument("--timeout", type=float, default=10.0, help="per-request timeout in seconds")
    parser.add_argument("--insecure", action="store_true", help="disable TLS certificate verification")
    parser.add_argument("--json", action="store_true", help="emit JSON")
    args = parser.parse_args()

    if args.local:
        obs = local_observation(args.php_bin)
    elif args.version:
        obs = version_observation(args)
    else:
        obs = remote_observation(args.url, args.phpinfo_paths, args.insecure, args.timeout)

    result = build_result(obs)
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print_human(result)
    return exit_code(result)


if __name__ == "__main__":
    sys.exit(main())

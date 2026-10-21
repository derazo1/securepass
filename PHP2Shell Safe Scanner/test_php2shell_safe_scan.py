import unittest
import urllib.error
from unittest import mock

import php2shell_safe_scan as scanner


class ClassificationTests(unittest.TestCase):
    def test_vulnerable_upstream_version(self):
        result = scanner.classify_version("8.3.35")
        self.assertEqual(result["status"], "VULNERABLE_BY_VERSION")
        self.assertTrue(result["vulnerable"])

    def test_fixed_version(self):
        result = scanner.classify_version("8.3.36")
        self.assertEqual(result["status"], "NOT_VULNERABLE_BY_VERSION")
        self.assertFalse(result["vulnerable"])

    def test_newer_patch_version(self):
        result = scanner.classify_version("8.5.13")
        self.assertFalse(result["vulnerable"])

    def test_eol_version(self):
        result = scanner.classify_version("8.1.34")
        self.assertEqual(result["status"], "VULNERABLE_EOL")
        self.assertTrue(result["vulnerable"])

    def test_future_branch_is_not_marked_vulnerable(self):
        result = scanner.classify_version("8.6.0")
        self.assertEqual(result["status"], "INDETERMINATE_BRANCH")
        self.assertIsNone(result["vulnerable"])

    def test_vendor_suffix_requires_backport_review(self):
        result = scanner.classify_version("8.3.35-0ubuntu0.24.04.1")
        self.assertEqual(result["status"], "REVIEW_VENDOR_BACKPORT")
        self.assertIsNone(result["vulnerable"])

    def test_hidden_version_is_indeterminate(self):
        result = scanner.classify_version(None)
        self.assertEqual(result["status"], "INDETERMINATE")
        self.assertIsNone(result["vulnerable"])


class ParsingTests(unittest.TestCase):
    def test_x_powered_by(self):
        version, source = scanner.extract_version({"X-Powered-By": "PHP/8.4.26"}, "")
        self.assertEqual(version, "8.4.26")
        self.assertEqual(source, "HTTP X-Powered-By")

    def test_phpinfo_body(self):
        body = "<title>phpinfo()</title><h1>PHP Version 8.2.35</h1>"
        version, source = scanner.extract_version({}, body)
        self.assertEqual(version, "8.2.35")
        self.assertEqual(source, "exposed phpinfo")

    def test_normal_page_does_not_leak_version(self):
        version, source = scanner.extract_version({"Server": "Apache"}, "WordPress wp-content")
        self.assertIsNone(version)
        self.assertIsNone(source)

    @mock.patch.object(scanner, "make_opener", return_value=object())
    @mock.patch.object(scanner, "http_get")
    def test_remote_phpinfo_classification(self, get_mock, _opener_mock):
        get_mock.side_effect = [
            {"url": "https://example.test/", "status": 200, "headers": {"Server": "Apache"}, "body": "home"},
            {"url": "https://example.test/phpinfo.php", "status": 200, "headers": {}, "body": "phpinfo() PHP Version 8.5.11"},
            {"url": "https://example.test/info.php", "status": 404, "headers": {}, "body": ""},
            {"url": "https://example.test/phpinfo", "status": 404, "headers": {}, "body": ""},
        ]
        observation = scanner.remote_observation("https://example.test", True, False, 1)
        result = scanner.build_result(observation)
        self.assertEqual(result["assessment"]["status"], "VULNERABLE_BY_VERSION")
        self.assertEqual(observation.exposed_phpinfo, ["https://example.test/phpinfo.php"])

    def test_cross_hostname_redirect_is_blocked(self):
        handler = scanner.ScopedRedirectHandler("example.test")
        with self.assertRaises(urllib.error.URLError):
            handler.redirect_request(None, None, 302, "Found", {}, "https://outside.test/")


if __name__ == "__main__":
    unittest.main()

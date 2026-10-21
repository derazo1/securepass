# Kibernum PHP2Shell Safe Scanner

Escáner no destructivo para **CVE-2026-109618** y **CVE-2026-109619**. No
envía multipart, no intenta provocar OOM/RCE, no enumera subdominios y no
intenta evadir CDN/WAF. Las redirecciones hacia un hostname diferente se
bloquean para no ampliar accidentalmente el alcance autorizado.

## Qué puede concluir

- `VULNERABLE_BY_VERSION`: versión PHP upstream conocida y menor que la
  versión corregida.
- `NOT_VULNERABLE_BY_VERSION`: versión igual o superior a la corregida.
- `REVIEW_VENDOR_BACKPORT`: número inferior, pero con sufijo de distribución;
  hay que revisar el changelog del paquete por posibles backports.
- `INDETERMINATE`: PHP detectado sin versión exacta.
- `VULNERABLE_EOL`: rama anterior a PHP 8.2, sin versión corregida upstream en
  la tabla del aviso.

Las mitigaciones de configuración se reportan como contexto y **nunca cambian
por sí solas un veredicto vulnerable a no vulnerable**.

## Uso

Comprobar el PHP local:

```bash
python3 php2shell_safe_scan.py --local
```

Evaluar una versión obtenida de un servidor:

```bash
python3 php2shell_safe_scan.py --version 8.3.35 --sapi fpm-fcgi \
  --upload-progress Off --memory-limit 128M
```

Inspección HTTP pasiva de un único objetivo:

```bash
python3 php2shell_safe_scan.py --url https://example.com
```

Consultar además tres rutas comunes de `phpinfo()` mediante GET normal:

```bash
python3 php2shell_safe_scan.py --url https://example.com --phpinfo-paths
```

Salida JSON y códigos para automatización:

```bash
python3 php2shell_safe_scan.py --version 8.3.36 --json
```

- `0`: no vulnerable según la versión observada.
- `1`: vulnerable según la versión observada.
- `2`: indeterminado o error.

## Umbrales incorporados

| Rama | Primera versión corregida |
|---|---:|
| 8.2 | 8.2.35 |
| 8.3 | 8.3.36 |
| 8.4 | 8.4.27 |
| 8.5 | 8.5.12 |

Fuentes primarias:

- <https://github.com/php/php-src/security/advisories/GHSA-w8hw-w9fx-j79w>
- <https://github.com/php/php-src/security/advisories/GHSA-6wmf-4rv5-p3rp>

La configuración CLI puede diferir de PHP-FPM o Apache. En producción se debe
confirmar la versión y configuración efectivas del SAPI web y, si el paquete
es de Ubuntu/Debian/RHEL, revisar el changelog de seguridad por backports.

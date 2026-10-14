#!/bin/sh
# Elige HTTP o HTTPS al arrancar según SECUREPASS_TLS y los certificados montados.
set -eu

CERT=/etc/nginx/certs/fullchain.pem
KEY=/etc/nginx/certs/privkey.pem
TEMPLATES=/etc/nginx/securepass
TARGET=/etc/nginx/conf.d/securepass.conf
TLS_MODE="${SECUREPASS_TLS:-auto}"
HTTPS_PORT="${SECUREPASS_HTTPS_PORT:-443}"

has_certs() {
  [ -r "$CERT" ] && [ -r "$KEY" ]
}

case "$TLS_MODE" in
  on)
    if ! has_certs; then
      echo "SECUREPASS_TLS=on, pero faltan $CERT o $KEY." >&2
      exit 1
    fi
    mode=https
    ;;
  off)
    mode=http
    ;;
  auto)
    if has_certs; then mode=https; else mode=http; fi
    ;;
  *)
    echo "SECUREPASS_TLS debe ser auto, on u off (recibido: $TLS_MODE)." >&2
    exit 1
    ;;
esac

case "$HTTPS_PORT" in
  '' | *[!0-9]*)
    echo "SECUREPASS_HTTPS_PORT debe ser un número (recibido: $HTTPS_PORT)." >&2
    exit 1
    ;;
esac

if [ "$mode" = https ]; then
  suffix=""
  [ "$HTTPS_PORT" = 443 ] || suffix=":$HTTPS_PORT"
  sed "s/__HTTPS_PORT_SUFFIX__/$suffix/" "$TEMPLATES/https.conf" > "$TARGET"
  echo "SecurePass: HTTPS activado."

  # Recarga periódica para tomar certificados renovados sin montar el socket de Docker.
  (
    while :; do
      sleep 43200
      nginx -s reload || true
    done
  ) &
else
  cp "$TEMPLATES/http.conf" "$TARGET"
  echo "SecurePass: modo HTTP. Monta certificados en /etc/nginx/certs para activar HTTPS."
fi

exec nginx -g 'daemon off;'

#!/bin/sh
# Opcional: emite un certificado de Let's Encrypt por DNS-01 y lo deja en ./certs.
# Requiere DOMAIN, ACME_EMAIL y DNS_PROVIDER en .env (ver .env.example).
set -eu

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  echo "Falta .env. Copia .env.example como .env y complétalo." >&2
  exit 1
fi

set -a
. ./.env
set +a

: "${DOMAIN:?Falta DOMAIN en .env}"
: "${ACME_EMAIL:?Falta ACME_EMAIL en .env}"
: "${DNS_PROVIDER:?Falta DNS_PROVIDER en .env}"

compose() {
  docker compose --profile letsencrypt "$@"
}

mkdir -p certs acme
compose up -d acme

compose exec acme --set-default-ca --server letsencrypt
compose exec acme --register-account -m "$ACME_EMAIL"

if [ "$DNS_PROVIDER" = "manual" ]; then
  if ! compose exec acme --issue --dns -d "$DOMAIN" --keylength ec-256 \
    --yes-I-know-dns-manual-mode-enough-go-ahead-please; then
    echo
    echo "Crea el registro TXT indicado arriba en el DNS público de $DOMAIN y, cuando esté publicado, ejecuta:"
    echo "  docker compose --profile letsencrypt exec acme --renew -d $DOMAIN --ecc --yes-I-know-dns-manual-mode-enough-go-ahead-please"
    echo "Después vuelve a lanzar este script para instalar el certificado."
    exit 0
  fi
else
  compose exec acme --issue --dns "$DNS_PROVIDER" -d "$DOMAIN" --keylength ec-256
fi

compose exec acme --install-cert -d "$DOMAIN" --ecc \
  --key-file /certs/privkey.pem \
  --fullchain-file /certs/fullchain.pem

echo "Certificado instalado en ./certs."
echo "Arranca o reinicia la aplicación para activar HTTPS: docker compose up -d --force-recreate securepass"

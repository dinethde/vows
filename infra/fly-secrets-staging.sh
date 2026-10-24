#!/usr/bin/env bash
# Pushes every staging secret to the two Fly apps, read from the Bitwarden
# vault inline. Nothing is printed, nothing is written to disk. Needs `bw`
# unlocked (BW_SESSION) and `fly` signed in. Values are staged and take effect
# on the next deploy.
set -euo pipefail

field() { # field <vault item> <field name>
  bw get item "$1" | python3 -c 'import sys,json; n=sys.argv[1]; print(next(f["value"] for f in json.load(sys.stdin)["fields"] if f["name"]==n), end="")' "$2"
}

SITE=https://vows-staging.vercel.app
MEDIA=https://pub-dc564b44038b4f979f548ab1cd05ba1b.r2.dev

for app in vows-api-staging vows-worker-staging; do
  fly secrets set --stage -a "$app" \
    DATABASE_URL="$(field staging/app-secrets DATABASE_URL)" \
    DATABASE_URL_UNPOOLED="$(field staging/app-secrets DATABASE_URL_UNPOOLED)" \
    REVALIDATE_SECRET="$(field staging/app-secrets REVALIDATE_SECRET)" \
    IP_HASH_SALT="$(field staging/app-secrets IP_HASH_SALT)" \
    CLERK_ISSUER="$(field clerk/dev-secrets 'Issuer URL')" \
    CLERK_JWKS_URL="$(field clerk/dev-secrets 'JWKS URL')" \
    R2_ACCOUNT_ID=6ed3169900a73c5766bbeaad1f4922af \
    R2_ACCESS_KEY_ID="$(field r2/dev-secrets 'Access Key ID')" \
    R2_SECRET_ACCESS_KEY="$(field r2/dev-secrets 'Secret Access Key')" \
    R2_BUCKET_ORIGINALS=vows-originals-staging \
    R2_BUCKET_PUBLIC=vows-media-staging \
    R2_BUCKET_BACKUPS=vows-backups-staging \
    RESEND_API_KEY="$(field resend/dev-secrets api-key)" \
    MAIL_FROM="$(field resend/dev-secrets from-address)" \
    WEB_ORIGINS="$SITE" SITE_URL="$SITE" MEDIA_URL="$MEDIA" >/dev/null
  echo "staged secrets for $app"
done

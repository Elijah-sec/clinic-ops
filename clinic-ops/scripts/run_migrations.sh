#!/usr/bin/env bash
set -euo pipefail

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL environment variable is required to run migrations."
  echo "Set it to your Postgres connection string (e.g. Supabase DB URL)."
  exit 1
fi

MIGRATIONS_DIR="$(dirname "$0")/../db/migrations"

if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found at $MIGRATIONS_DIR"
  exit 1
fi

echo "Applying migrations from $MIGRATIONS_DIR to $DATABASE_URL"

for f in $(ls "$MIGRATIONS_DIR"/*.sql | sort); do
  echo "---> Applying $f"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
done

echo "Migrations complete."

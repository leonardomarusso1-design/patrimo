#!/usr/bin/env bash
# Cria um Postgres descartável, aplica a migration 0025 e prova a trava.
# Local: sudo -u postgres bash supabase/tests/run-profile-billing-check.sh
# CI: PGHOST, PGUSER e PGPASSWORD apontando para um Postgres vazio.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DB_NAME="ordre_billing_check"

psql -v ON_ERROR_STOP=1 -d postgres -c \
  "select pg_terminate_backend(pid) from pg_stat_activity where datname = '${DB_NAME}' and pid <> pg_backend_pid();" \
  >/dev/null
psql -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists ${DB_NAME};"
psql -v ON_ERROR_STOP=1 -d postgres -c "create database ${DB_NAME};"
psql -v ON_ERROR_STOP=1 -d "${DB_NAME}" -f "${ROOT}/supabase/tests/profile_billing_behavior.sql"
psql -v ON_ERROR_STOP=1 -d postgres -c "drop database if exists ${DB_NAME};"

echo "profile billing lock ok"

#!/bin/sh
# Construct DATABASE_URL with proper encoding if individual vars are set
if [ -n "$DB_HOST" ] && [ -n "$DB_PASSWORD" ]; then
  ENCODED_PW=$(node -e "console.log(encodeURIComponent(process.env.DB_PASSWORD))")
  export DATABASE_URL="postgresql://${DB_USER:-postgres}:${ENCODED_PW}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME:-eamgmt}?schema=public"
fi

echo "Pushing database schema..."
npx prisma db push --accept-data-loss 2>&1 || echo "Warning: Schema push failed, continuing..."
echo "Starting server..."
node dist/index.js

#!/bin/sh

echo "⏳ En attente de PostgreSQL à $DB_HOST:$DB_PORT..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done

echo "✅ PostgreSQL est prêt ! Démarrage de l'app..."
exec "$@"

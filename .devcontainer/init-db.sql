-- Auto-create siamese_db database on first startup
SELECT 'CREATE DATABASE siamese_db'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'siamese_db')\gexec

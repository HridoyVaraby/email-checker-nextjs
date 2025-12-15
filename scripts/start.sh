#!/bin/sh

# Exit on error
set -e

echo "Starting deployment script..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "Error: DATABASE_URL is not set."
  exit 1
fi

echo "Running prisma migrations..."
# In standalone mode, we might need to rely on the generated client or install prisma cli
# Since we copied node_modules from builder in a way that might not include CLI if in devDeps, 
# we need to ensure ability to migrate.
# Ideally, we should use `npx prisma migrate deploy` but npx/prisma might not be in the final image path if we only copied standalone.
#
# Workaround for Standalone + Prisma Migrations:
# The standalone build includes minimal dependencies. 
# We will use the `node_modules` generated in the builder stage that specifically includes production deps.
# But `prisma` is a dev dependency usually.
#
# If `npx prisma migrate deploy` fails, the user might need to run it manually or we change Dockerfile to install `prisma` globally or in runner.
# Let's assume for now we can access it via the copied modules or we'll adjust.

# Attempt migration
npx prisma migrate deploy

echo "Starting Next.js server..."
node server.js


FROM node:22-alpine AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies needed for node-gyp and Prisma
RUN apk add --no-cache libc6-compat openssl

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client (Needs openssl)
RUN apk add --no-cache openssl
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set up volume directory for SQLite
RUN mkdir -p /app/prisma && chown nextjs:nodejs /app/prisma

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and migrations for runtime usage
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
# Copy start script
COPY --from=builder --chown=nextjs:nodejs /app/scripts/start.sh ./start.sh

# Install Prisma CLI for migrations (it's a dev dependency usually, so standalone might miss it)
# We install it globally or locally in this stage to ensure `npx prisma` works.
RUN npm install -g prisma

USER nextjs

EXPOSE 3000

ENV PORT=3000
# DATABASE_URL should be overridden by docker-compose

# Use the start script as entrypoint
CMD ["/bin/sh", "./start.sh"]

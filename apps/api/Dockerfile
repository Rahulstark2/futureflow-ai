FROM node:20-alpine AS base

# Install OpenSSL for Prisma and libc compatibility
RUN apk add --no-cache openssl libc6-compat

# Install pnpm
RUN npm install -g pnpm@10.12.4

WORKDIR /app

# Copy root workspace configurations
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/

# Install workspace dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

WORKDIR /app/apps/api

# Generate Prisma Client and compile TypeScript
RUN npx prisma generate
RUN npm run build

EXPOSE 4000

# Automatically run schema migrations and start API server
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]

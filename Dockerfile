# syntax=docker/dockerfile:1
FROM node:22-bookworm-slim AS base
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
# Pages read company settings from the database at build time, so the build
# needs the real .env. It is mounted as a secret and never stored in a layer.
RUN --mount=type=secret,id=envfile,target=/app/.env npm run build

FROM base AS runner
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
COPY --from=build /app/package.json /app/package-lock.json /app/next.config.ts /app/tsconfig.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma
# Uploaded media is mounted here at runtime (see docker-compose.yml).
# docker-compose.yml runs the container as uid 1002 (the host's telvin user), so
# that uid must own the upload mount point and be able to write the image cache.
RUN mkdir -p uploads .next/cache && chown -R 1002:1002 /app/uploads /app/.next
USER node
EXPOSE 3000
CMD ["npm", "run", "start"]

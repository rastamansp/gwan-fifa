# Gwan FIFA — API (NestJS) | build context = raiz do monorepo
# build: docker build -f apps/api/Dockerfile -t gwan-fifa-api .

# ===== build =====
FROM node:20-bookworm-slim AS build
WORKDIR /app

# manifests primeiro (cache de layer de deps)
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/api/package.json ./apps/api/
RUN npm ci

# fontes do que a API precisa (core + api)
COPY packages/core ./packages/core
COPY apps/api ./apps/api

# core (dist) -> api (nest build)
RUN npm run build --workspace @gwan-fifa/core \
 && npm run build --workspace @gwan-fifa/api

# remove devDeps (mantem runtime: @nestjs/*, sharp, minio, etc.)
RUN npm prune --omit=dev

# ===== runtime =====
FROM node:20-bookworm-slim AS runtime
# Fontes para o librsvg renderizar os textos da figurinha (sharp/SVG).
# Sem isso, os textos somem no Linux (Arial não existe; cai no fallback).
RUN apt-get update \
 && apt-get install -y --no-install-recommends fonts-liberation fontconfig \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# deps de producao + workspace core (node_modules/@gwan-fifa/core -> packages/core)
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/packages/core/package.json ./packages/core/package.json
COPY --from=build /app/packages/core/dist ./packages/core/dist
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist

EXPOSE 3000

# healthcheck usa o fetch global do Node 20 (REQ: GET /api/health)
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3000)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "apps/api/dist/main.js"]

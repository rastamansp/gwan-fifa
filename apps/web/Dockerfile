# Gwan FIFA — Web (React/Vite -> nginx) | build context = raiz do monorepo
# build: docker build -f apps/web/Dockerfile --build-arg VITE_API_BASE_URL=https://api-worldcup.gwan.cloud -t gwan-fifa-web .

# ===== build =====
FROM node:20-bookworm-slim AS build
WORKDIR /app

# URL da API e injetada no bundle em build-time (Vite)
ARG VITE_API_BASE_URL=https://api-worldcup.gwan.cloud
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages/core/package.json ./packages/core/
COPY apps/web/package.json ./apps/web/
RUN npm ci

COPY packages/core ./packages/core
COPY apps/web ./apps/web

# core (tipos/dist) -> web (tsc -b && vite build)
RUN npm run build --workspace @gwan-fifa/core \
 && npm run build --workspace @gwan-fifa/web

# ===== runtime (nginx) =====
FROM nginx:alpine AS runtime
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/web/dist /usr/share/nginx/html
EXPOSE 80

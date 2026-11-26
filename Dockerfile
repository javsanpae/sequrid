# syntax=docker/dockerfile:1

# ---- Build the static site (runs on the build host's architecture) ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY index.html vite.config.ts svelte.config.js tsconfig.json ./
COPY public ./public
COPY src ./src
ARG APP_VERSION=dev
ARG SOURCE_URL=https://github.com/javsanpae/sequrid
ENV VITE_APP_VERSION=$APP_VERSION \
    VITE_SOURCE_URL=$SOURCE_URL
RUN npm run build

# ---- Serve it with an unprivileged nginx: no backend, no storage ----
FROM nginxinc/nginx-unprivileged:1.29-alpine
ARG APP_VERSION=dev
ARG SOURCE_URL=https://github.com/javsanpae/sequrid
LABEL org.opencontainers.image.title="sequrid" \
      org.opencontainers.image.description="Protege tu DNI con marca de agua y tapa datos sensibles. Todo se procesa en el navegador." \
      org.opencontainers.image.source="$SOURCE_URL" \
      org.opencontainers.image.licenses="AGPL-3.0-or-later" \
      org.opencontainers.image.version="$APP_VERSION"
ENV NGINX_ENTRYPOINT_QUIET_LOGS=1
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=build /app/dist /usr/share/nginx/html
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO /dev/null http://127.0.0.1:8080/healthz || exit 1

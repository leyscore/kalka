# Kalka server in Docker: the same Worker and Durable Objects as on Cloudflare, run by the
# open-source workerd runtime. Data (SQLite files) lives in /data; mount a volume there.
#
#   docker build -t kalka-server .
#   docker run -p 8787:8787 -v kalka-data:/data -e KALKA_SETUP_CODE=… kalka-server
#
# With single sign-on, pass the license key as a build secret: the build uses it only to
# download the enterprise module, and the key never lands in the image. The server reads it at
# run time, so pass it to the container too:
#   docker build --secret id=kalka_license,env=KALKA_LICENSE_KEY -t kalka-server .
#   docker run … -e KALKA_LICENSE_KEY=… kalka-server

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN --mount=type=secret,id=kalka_license \
    if [ -f /run/secrets/kalka_license ]; then export KALKA_LICENSE_KEY="$(cat /run/secrets/kalka_license)"; fi; \
    KALKA_DATA_DIR=/data KALKA_PORT=8787 npm run bundle \
 && mkdir -p /out \
 && cp dist/index.js dist/config.capnp /out/ \
 && cp "$(node -p "require.resolve('@cloudflare/workerd-linux-' + (process.arch === 'arm64' ? 'arm64' : '64') + '/bin/workerd')")" /out/workerd

FROM debian:bookworm-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends ca-certificates curl \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --system --uid 10001 --home /data kalka \
 && mkdir -p /data && chown kalka /data
COPY --from=build /out/ /srv/kalka/
WORKDIR /srv/kalka
USER kalka
VOLUME /data
EXPOSE 8787
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s CMD curl -fsS http://127.0.0.1:8787/healthz || exit 1
LABEL org.opencontainers.image.title="Kalka server" \
      org.opencontainers.image.description="Self-hosted server for the Kalka design editor: shared files and real-time collaboration." \
      org.opencontainers.image.licenses="AGPL-3.0-only" \
      org.opencontainers.image.source="https://github.com/leyscore/kalka"
ENTRYPOINT ["/srv/kalka/workerd", "serve", "config.capnp", "--experimental"]

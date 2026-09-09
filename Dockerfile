# Multi-stage build: Astro's SSG output is pure static files, so production
# serves them via nginx (gzip + cached assets) instead of Astro's Node
# preview server.
FROM node:26-alpine AS builder

############################################
# General Docker image configuration
############################################
WORKDIR /srv/app

############################################
# Install pnpm
############################################
RUN npm install -g pnpm@10

############################################
# Non-root user
############################################
RUN chown -R node:node /srv/app
USER node
COPY --chown=node:node [ "package.json", "pnpm-lock.yaml", "astro.config.mjs", "tsconfig.json", "./"]
COPY --chown=node:node [ "public", "public"]
COPY --chown=node:node [ "src", "src"]

############################################
# Building Application
############################################
ARG BACKEND_URL=https://api.thilo.scouts.ch/
ARG SITE_URL=https://thilo.scouts.ch
ARG SHOW_DRAFTS=false
ENV BACKEND_URL=$BACKEND_URL
ENV SITE_URL=$SITE_URL
ENV SHOW_DRAFTS=$SHOW_DRAFTS

RUN pnpm install --frozen-lockfile
RUN pnpm build

############################################
# Production stage with nginx (unprivileged)
############################################
FROM nginxinc/nginx-unprivileged:1.31.5

COPY --from=builder /srv/app/build /usr/share/nginx/html
COPY [ "./docker/nginx.conf", "/etc/nginx/conf.d/default.conf" ]

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]


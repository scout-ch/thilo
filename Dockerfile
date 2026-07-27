# Multi-stage build: Astro's SSG output is pure static files, so production
# serves them via nginx (gzip + cached assets) instead of Astro's Node
# preview server.
FROM node:26-alpine AS builder

############################################
# General Docker image configuration
############################################
WORKDIR /srv/app

############################################
# System Dependencies
############################################
RUN apk update && apk add --no-cache dos2unix

############################################
# Install pnpm
############################################
RUN npm install -g pnpm@10

############################################
# None root user
############################################
RUN chown -R node:node /srv/app
USER node
COPY --chown=node:node [ "package.json", "pnpm-lock.yaml", "astro.config.mjs", "tsconfig.json", "./"]
COPY --chown=node:node [ "./docker/entrypoint.sh", "./entrypoint.sh"]
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

RUN chmod +x entrypoint.sh
RUN dos2unix entrypoint.sh

############################################
# Production stage with nginx
############################################
FROM nginx:alpine

COPY --from=builder /srv/app/build /usr/share/nginx/html
COPY --from=builder /srv/app/entrypoint.sh /entrypoint.sh

# astro.config.mjs sets build.format: 'file', so every route is <route>.html
# (not <route>/index.html) - no SPA fallback needed, each route is a real file
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    location / { \
        try_files $uri $uri.html $uri/ =404; \
    } \
    error_page 404 /404.html; \
    \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript application/manifest+json image/svg+xml; \
    \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|webp|woff|woff2)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

RUN chmod +x /entrypoint.sh
RUN dos2unix /entrypoint.sh

EXPOSE 3000
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]

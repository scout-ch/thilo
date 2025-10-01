# Multi-stage build for production
FROM node:22.2.0-alpine as builder

############################################
# General Docker image configuration
############################################
WORKDIR /srv/app

############################################
# System Dependencies
############################################
RUN apk update && apk add --no-cache gettext dos2unix

############################################
# None root user
############################################
RUN chown -R node:node /srv/app
USER node
COPY --chown=node:node [ "package.json", "package-lock.json", "vite.config.ts", "tsconfig.json", "index.html", "404.html", "./"]
COPY --chown=node:node [ "./docker/entrypoint.sh", "./entrypoint.sh"]
COPY --chown=node:node [ "public", "public"]
COPY --chown=node:node [ "src", "src"]

############################################
# Building Application
############################################
ENV REACT_APP_PUBLIC_URL=/
RUN sed -i "s|base: '/thilo/',|base: '/',|g" vite.config.ts
RUN npm install
RUN export NODE_OPTIONS=--openssl-legacy-provider && npm run build

# Create backend export
RUN node src/scripts/strapiToJson.js
RUN mv exports build/exports

RUN chmod +x entrypoint.sh
RUN dos2unix entrypoint.sh

############################################
# Production stage with nginx
############################################
FROM nginx:alpine

# Copy built application
COPY --from=builder /srv/app/build /usr/share/nginx/html
COPY --from=builder /srv/app/entrypoint.sh /entrypoint.sh

# Create nginx config for SPA routing
RUN echo 'server { \
    listen 3000; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Handle client-side routing \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    \
    # Gzip compression \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    \
    # Cache static assets \
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
        expires 1y; \
        add_header Cache-Control "public, immutable"; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf.dpkg-old 2>/dev/null || true

# Make entrypoint executable
RUN chmod +x /entrypoint.sh
RUN dos2unix /entrypoint.sh

EXPOSE 3000
ENTRYPOINT [ "/entrypoint.sh" ]
CMD ["nginx", "-g", "daemon off;"]

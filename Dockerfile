FROM node:22.2.0-alpine

############################################
# General Docker image configuration
############################################
WORKDIR /srv/app
EXPOSE 3000
CMD [ "npm", "run", "serve" ]
ENTRYPOINT [ "./entrypoint.sh" ]

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
RUN chmod +x entrypoint.sh
RUN dos2unix entrypoint.sh

USER root
RUN chgrp -R 0 /srv/app && \
    chmod -R g=u /srv/app
USER node

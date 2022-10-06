FROM node:18.3.0-alpine3.14

ARG UID=1001
WORKDIR /srv/app

EXPOSE 3000
CMD [ "npm", "start" ]

RUN adduser --disabled-password --uid "$UID" app

COPY [ "package.json", "package-lock.json", "craco.config.js", "tsconfig.json",  "./"]
RUN npm install

COPY [ "public", "public"]
COPY [ "src", "src"]
RUN export NODE_OPTIONS=--openssl-legacy-provider && npm run build

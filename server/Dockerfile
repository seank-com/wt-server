
FROM node:10.2-alpine AS base

RUN apk update && apk add --no-cache tini

ENTRYPOINT ["/sbin/tini", "--"]

WORKDIR /home/server

FROM base AS builder

RUN apk update && apk add --no-cache \
    git \
    python \
    python-dev \
    py-pip \
    build-base \
    libc6-compat \
    && pip install virtualenv

COPY package*.json ./

RUN npm install

COPY src/*.js src/

FROM base AS release

COPY --from=builder /home/server .

ENV NODE_ENV=production

EXPOSE 8686
EXPOSE 8080

USER node

CMD ["node", "src/index.js"]



FROM arm32v7/node AS base

#ENV TINI_VERSION v0.18.0
#ADD https://github.com/krallin/tini/releases/download/${TINI_VERSION}/tini /tini
#RUN chmod +x /tini
#ENTRYPOINT ["/tini", "--"]

WORKDIR /home/server

FROM base AS builder

#RUN apt-get update && apt-get install -y \
#    git \
#    python \
#    python-dev \
#    pip \
#    build-base \
#    libc6-compat \
#    && pip install virtualenv

COPY package*.json ./

RUN npm install

COPY src/*.js src/

FROM base AS release

COPY --from=builder /home/server .

ENV NODE_ENV=production

EXPOSE 8686

USER node

CMD ["node", "src/index.js"]


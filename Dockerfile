# syntax=docker/dockerfile:1



FROM node:18-alpine

WORKDIR /script

COPY rabbitmq.json ./

COPY rabbitmq-setup-script/rabbitmq-setup-script.js ./

COPY rabbitmq-setup-script/default-settings.json ./

COPY .github/scripts/run.sh ./

RUN nmp i

ENTRYPOINT [ "bin/bash run.sh" ]


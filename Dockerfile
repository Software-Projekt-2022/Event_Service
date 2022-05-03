# syntax=docker/dockerfile:1



FROM node:18-alpine

WORKDIR /script

COPY / ./
COPY rabbitmq-setup-script/* ./
COPY rabbitmq.json ./

COPY rabbitmq-setup-script/rabbitmq-setup-script.js ./

COPY rabbitmq-setup-script/default-settings.json ./

COPY .github/scripts/run.sh ./

RUN npm i

ENTRYPOINT [ "bin/bash run.sh" ]


# syntax=docker/dockerfile:1



FROM node:18-alpine

WORKDIR /script

COPY rabbitmq-setup-script/* ./
COPY rabbitmq.json ./

COPY docker-scripts/run.sh ./

RUN npm i

ENTRYPOINT [ "bin/bash run.sh" ]


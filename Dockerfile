# syntax=docker/dockerfile:1



FROM node:16

WORKDIR /

COPY rabbitmq-setup-script/* ./
COPY conf/*  ./

COPY docker-scripts/run.sh ./

RUN npm i
RUN chmod +rx /
CMD [ "/bin/sh","run.sh" ]


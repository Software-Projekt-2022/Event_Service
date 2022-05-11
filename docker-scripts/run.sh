#!/bin/sh

apk --no-cache add curl

#Import definition frin rabbitmq.json
curl -u guest:guest -X POST -T /rabbitmq.json http://rabbitmq:15672/api/definitions

node rabbitmq-setup-script.js default-settings.json
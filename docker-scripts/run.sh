#!/bin/sh
echo "Sleep 60 seconds for rabbitmq startup"
sleep 60
echo "Running Script"
node rabbitmq-setup-script.js /default-settings.json
echo "Finished"
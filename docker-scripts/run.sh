#!/bin/sh
echo "Sleep 15 seconds for rabbitmq startup"
sleep 15
echo "Running Script"
node rabbitmq-setup-script.js /default-settings.json
echo "Finished"
# RabbitMQ Setup Script

Dieses Script dient dazu, bei RabbitMQ einzustellen,
welche Microservices welche Events von welchen Microservices empfangen können.
Das könnte man auch manuell mit dem User-Interface einstellen, ist aber etwas aufwändiger. Das Script setzt voraus, dass die notwendigen Queues und Exchanges schon erstellt worden sind. Das kann erreicht werden, indem die `rabbitmq.json` im Root-Verzeichnis dieses Repositorys in RabbitMQ importiert wird.
Außerdem wird angenommen, dass RabbitMQ auf dem Standard-Port auf `localhost` läuft.

Das Script kann mit node.js ausgeführt werden.
Dazu müssen erst die lokalen Abhängigkeiten (AMQP-Library) installiert werden:

```
npm i
```

Danach kann das Script ausgeführt werden:

```
node rabbitmq-setup-script.js <input file name>
```

Als Argument wird eine JSON-Datei erwartet, welche die Einstellungen für
das Empfangen von Events enthält.

In diesem Ordner gibt es eine Template-Datei namens `default-settings.json`,
die Definitionen enthält, dass jeder Microservice jedes Event von jedem Microservice außer sich selbst empfangen kann.
Am sonsten sollte die Datei selbsterklärend sein.

Beim Ausführen sollte die Ausgabe ungefähr so aussehen:

```
$ node rabbitmq-setup-script.js default-settings.json
Clearing bindings...
Creating bindings...
Done
```
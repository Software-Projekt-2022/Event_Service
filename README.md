# Event Service

## RabbitMQ Setup Tool

In dem Ordner `rabbit-setup-script` befindet sich ein Script,
mit dem sich in RabbitMQ leicht alle Queues, Exchanges und Bindings
einrichten lassen.
Außerdem lässt sich leicht einstellen,
welche Microservices welche Events von welchen Microservices empfangen können.

## Event Bus Beispiele

In dem Ordner `examples` befinden sich Anleitungen,
wie man als Microservice mit dem Event-System umgehen kann.
Die Beispiele sind nach Sprache sortiert und enthalten jeweils ein ausführbares Beispielprogramm.

Im Moment gibt es Beispiele für die folgenden Sprachen:

* JavaScript mit Node.js
* Java

## Event JSON Schemas

Im Ordner `schemas` befinden sich [JSON-Schemas](https://json-schema.org/)
für viele Events, die für die Validierung verwendet werden können.

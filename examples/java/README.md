# Beispiel zur Verwendung des Message Bus mit Java

Dieses Beispiel zeigt, wie ein Microservice mit Java den Message Bus nutzen kann,
um Events zu senden und zu empfangen.

Es wird vorausgesetzt, dass ein Gradle-Projekt vorbereitet worden ist.
Wir benutzen den AMPQ-Client von RabbitMQ, um mit dem Message Bus zu interagieren
und GSON, um die JSON-Strings zu erzeugen.
Dazu legen wir in der `build.gradle` den folgenden `dependencies`-Block an.

```groovy
dependencies
{
	implementation 'com.rabbitmq:amqp-client:5.14.2'
	implementation 'com.google.code.gson:gson:2.9.0'
}

```

Zuerst werden Konstanten definiert, die später nützlich sind.

```java
private static final String MICROSERVICE_NAME = "microservice.umwelt";
private static final String MICROSERVICE_PREFIX = "UMW-";
private static final String MICROSERVICE_EXCHANGE = "publish_event.umwelt";
private static final String MICROSERVICE_QUEUE = "microservice.umwelt";
```

Diese Werte können aus der [Dokumentation des Event-Systems](https://software-projekt-2022.github.io/Dokumentation/#/_einleitung/projektuebersicht?id=event-bus) entnommen werden.

### Verbindung aufbauen

Um eine Verbindung zum Message Bus aufzubauen, müssen wir zuerst eine
`ConnectionFactory` erstellen. Diese kann verwendet werden, um Verbindungen zu erstellen.
Die `ConnectionFactory` ist auch in der Lage,
Verbindungen automatisch wiederherzustellen werden, falls die Verbindung unterbrochen wird.

```java
connectionFactory.setHost("localhost");

//Verbindung und Channel erstellen
connection = connectionFactory.newConnection();
channel = connection.createChannel();

/* Jetzt kann hier die Verbindung genutzt werden */
```
Beachte, dass hier der Einfachheit halber Exception Handling weggelassen wurde.

### Events senden

Jetzt sind wir bereit, ein Event zu senden.
Dafür erstellen wir erst eine Klasse, die ein Event darstellt.
Diese Klasse kann auch in einen JSON-String umgewandelt werden.
Um JSON zu erzeugen wird hier die oben genannte Library GSON verwendet.

```java
private static class AdminMessageBroadcastEvent
{
    final String event_id = MICROSERVICE_PREFIX + System.currentTimeMillis();
    final String event_type = "admin_message_broadcast";
    final String event_origin = MICROSERVICE_NAME;
    final String event_time = Instant.now().toString();
    String message;

    @Override
    public String toString()
    {
        JsonObject root = new JsonObject();
        root.addProperty("event_id", event_id);
        root.addProperty("event_type", event_type);
        root.addProperty("event_origin", event_origin);
        root.addProperty("event_time", event_time);
        JsonObject content = new JsonObject();
        content.addProperty("message", message);
        root.add("content", content);
        return root.toString();
    }
}
```

Diese Klasse stellt ein Event mit einer fast einzigartigen ID und der aktuellen Zeit dar.

Dieses Event kann mit der `basicPublish`-Methode des Channels gesendet werden,
muss dafür aber erst in einen String umgewandelt werden.
Die Argumente der `publish`-Methode sind die Exchange,
der Rounting Key und der Inhalt. Der Routing Key ist hier der Event-Typ.

```java
AdminMessageBroadcastEvent event = new AdminMessageBroadcastEvent();
event.message = "Das ist eine Nachricht vom Admin :)";
String msg = event.toString();

//Verwendet die Exchange des Microservices und event_type als Rounting-Key
channel.basicPublish(MICROSERVICE_EXCHANGE, event.event_type, null, msg.getBytes(StandardCharsets.UTF_8));
```

Es ist wichtig, dass die Exchange und Queues, die hier verwendet werden, auch existieren.
Sonst wird eine Exception geworfen.
Wenn RabbitMQ richtig eingestellt ist und die Queue- und Exchange-Namen denen in unserer Dokumentation entsprechen,
sollte es aber immer funktionieren.

### Events empfangen

Um Events zu empfangen, kann die `basicConsume`-Methode des Channels verwendet werden.
Diese Methode nimmt als Argument eine Callback-Funktion an, die immer Aufgerufen wird,
wenn ein Event empfangen wird. Events werden im Hintergrund empfangen. Die `consume`-Methode
blockiert also nicht.

```java
//Wichtig: Parameter "autoAck" auf "true" für automatisches Acknowledgement
channel.basicConsume(MICROSERVICE_QUEUE, true, (consumerTag, delivery) ->
{
    /* Wird immer ausgeführt, wenn ein Event empfangen wird */
    String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
    
    System.out.printf("Event received: \"%s\"\n", event);
}, consumerTag -> { });
```

Das ist alles, was getan werden muss, um Events zu senden und zu empfangen.
Den kompletten ausführbaren Code kann man in der Datei `src/Example.java` finden.

### Hinweis

Dieses Beispiel ist nur ein minimales Programm, was demonstriert,
wie Microservices den Message Bus benutzen können.
Hier wurden Dinge weggelassen, um die sich ein Server zusätzlich kümmern muss, wie z. B.
Connection Handling. Es kann nämlich passieren, dass die Verbindung aus irgendeinem Grund abbricht.
Das muss erkannt werden und die Verbindung muss neu aufgebaut werden.
Sonst kann nichts mehr gesendet oder empfangen werden.
Man sollte auch nicht für jedes zu sendende Event eine neue Verbindung aufbauen,
sondern die selbe Verbindung während der gesamten Laufzeit des Programms wiederverwenden.

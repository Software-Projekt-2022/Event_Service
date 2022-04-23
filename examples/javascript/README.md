# Beispiel zur Verwendung des Message Bus mit JavaScript

Dieses Beispiel zeigt, wie ein Microservice mit JavaScript den Message Bus nutzen kann,
um Events zu senden und zu empfangen.

Es wird vorausgesetzt, dass ein Projektordner mit Node.js vorbereitet worden ist.
Wir benutzen das Package `amqplib`, welches erst mit npm installiert werden muss.

```
npm install amqplib
```

In einer neuen JavaScript-Datei müssen wir erst das `amqplib`-Package einbinden.

```js
const amqp = require('amqplib/callback_api')
```

Als nächstes werden Konstanten definiert, die später nützlich sind.

```js
const microservice_name = 'microservice.umwelt'
const microservice_prefix = 'UMW-'
const microservice_exchange = 'publish_event.umwelt'
const microservice_queue = 'microservice.umwelt'
```

Diese Werte können aus der [Dokumentation des Event-Systems](https://software-projekt-2022.github.io/Dokumentation/#/_einleitung/projektuebersicht?id=event-bus) entnommen werden.

### Verbindung aufbauen

Mit der Funktion `amqp.connect()` kann eine Verbindung zum Message Bus aufgebaut werden.

```js
amqp.connect('amqp://localhost', (err, connection) =>
{
    if (err) throw err

    /* Verbindung kann hier genutzt werden */
})
```

Mit dieser Verbindung können wir nun einen Channel erstellen,
den wir für das Senden und Empfangen von Events nutzen.

```js
connection.createChannel((err, channel) =>
{
    if (err) throw err
    
    /* Channel kann hier genutzt werden */
})
```

### Events senden

Jetzt sind wir bereit, ein Event zu senden.
Dafür erstellen wir erst eine Funktion, um ein Event zu erstellen.

```js
function makeEvent()
{
    return {
        event_id: microservice_prefix + Date.now(),
        event_type: "admin_message_broadcast",
        event_origin: microservice_name,
        event_time: new Date().toISOString(),
        content:
        {
            message: "Das ist eine Nachricht vom Admin :)"
        }
    }
}
```

Diese Funktion generiert bei jedem Aufruf ein Event mit einer fast einzigartigen ID und der aktuellen Zeit.

Dieses Event kann mit der `publish`-Methode des Channels gesendet werden,
muss dafür aber erst in einen String umgewandelt werden.
Die Argumente der `publish`-Methode sind die Exchange,
der Rounting Key und der Inhalt. Der Routing Key ist hier der Event-Typ.

```js
var event = makeEvent()
var msg = JSON.stringify(event)

channel.publish(microservice_exchange, event.event_type, Buffer.from(msg))
```

Es ist wichtig, dass die Exchange und Queues, die hier verwendet werden, auch existieren.
Sonst wird eine Exception geworfen.
Wenn RabbitMQ richtig eingestellt ist und die Queue- und Exchange-Namen denen in unserer Dokumentation entsprechen,
sollte es aber immer funktionieren.

### Events empfangen

Um Events zu empfangen, kann die `consume`-Methode des Channels verwendet werden.
Diese Methode nimmt als Argument eine Callback-Funktion an, die immer Aufgerufen wird,
wenn ein Event empfangen wird. Events werden im Hintergrund empfangen. Die `consume`-Methode
blockiert also nicht.

```js
channel.consume(microservice_queue, msg =>
{
    /* Hier können Events empfangen werden */
    if(msg.content)
    {
        console.log('Event received: "%s"', msg.content.toString())
    }
},
{
    //Wichtig: automatisches Acknowledgement
    noAck: true
})
```

Das ist alles, was getan werden muss, um Events zu senden und zu empfangen.
Den kompletten ausführbaren Code kann man in der Datei `example.js` finden.

### Hinweis

Dieses Beispiel ist nur ein minimales Programm, was demonstriert,
wie Microservices den Message Bus benutzen können.
Hier wurden Dinge weggelassen, um die sich ein Server zusätzlich kümmern muss, wie z. B.
Connection Handling. Es kann nämlich passieren, dass die Verbindung aus irgendeinem Grund abbricht.
Das muss erkannt werden und die Verbindung muss neu aufgebaut werden.
Sonst kann nichts mehr gesendet oder empfangen werden.
Man sollte auch nicht für jedes zu sendende Event eine neue Verbindung aufbauen,
sondern die selbe Verbindung während der gesamten Laufzeit des Programms wiederverwenden.

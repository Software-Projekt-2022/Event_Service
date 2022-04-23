/*
 * Dieses Programm dient als Beispiel.
 * Es wird eine Verbindung zum Message Bus aufgebaut
 * und ein beispielhaftes Event gesendet.
 * Danach wartet das Programm und gibt alle Events auf der Konsole aus,
 * die empfangen werden.
 */

const amqp = require('amqplib/callback_api');

/*
 * (Werte von https://software-projekt-2022.github.io/Dokumentation/#/_einleitung/projektuebersicht?id=event-bus).
 */
const microservice_name = 'microservice.umwelt';
const microservice_prefix = 'UMW-';
const microservice_exchange = 'publish_event.umwelt';
const microservice_queue = 'microservice.umwelt';

//Verbindung und Channel für Message Bus
var amqp_connection;
var amqp_channel;

/**
 * Funktion zum Erstellen eines beispielhaften Events.
 */
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
    };
}

/**
 * Funktion zum Aufbauen der Verbindung zum Message Bus.
 * Diese Funktion blockiert nicht.
 * @param done wird ausgeführt, wenn die Verbindung aufgebaut wurde
 */
function connect(done)
{
    //Auf localhost verbinden
    amqp.connect('amqp://localhost', (conn_err, connection) =>
    {
        if (conn_err)
        {
            throw conn_err;
        }
        
        amqp_connection = connection;

        //Channel erstellen
        connection.createChannel((ch_err, channel) =>
        {
            if (ch_err)
            {
                throw ch_err;
            }
            
            amqp_channel = channel;
            done();
        });
    });
}

/**
 * Sendet ein beispielhaftes Event, so als würde ein Microservice ein Event senden.
 * Es wird die Exchange des Microservice benutzt.
 */
function sendEvent()
{
    var event = makeEvent();
    var msg = JSON.stringify(event);

    //Verwendet die Exchange des Microservices und event_type als Rounting-Key
    //Sendet das Event
    amqp_channel.publish(microservice_exchange, event.event_type, Buffer.from(msg));
    console.log('Sent event %s: "%s"', event.event_type, msg);
}

/**
 * Wird immer ausgefürt, wenn ein Event empfangen wurde.
 */
function onEventReceived(event)
{
    console.log('Event received: "%s"', event)
}

/**
 * Diese Funktion blockiert nicht und lässt das Programm im Hintergrund auf Events warten.
 */
function listenForEvents()
{
    amqp_channel.consume(microservice_queue, msg =>
    {
        //Wird immer ausgeführt, wenn ein Event empfangen wird
        if(msg.content)
        {
            onEventReceived(msg.content.toString())
        }
    },
    {
        //Wichtig: automatisches Acknowledgement
        noAck: true
    });
    console.log('Now listening for events. Press CTRL + C to cancel.');
}

//Es wird im Hintergrund eine Verbindung aufgebaut, ein Event gesendet und dann auf Events gewartet.
connect(() =>
{
    sendEvent();
    listenForEvents();
});

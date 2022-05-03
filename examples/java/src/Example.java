import com.google.gson.JsonObject;
import com.rabbitmq.client.Channel;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.DeliverCallback;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.concurrent.TimeoutException;

/**
 * Dieses Programm dient als Beispiel.
 * Es wird eine Verbindung zum Message Bus aufgebaut
 * und ein beispielhaftes Event gesendet.
 * Danach wartet das Programm und gibt alle Events auf der Konsole aus,
 * die empfangen werden.
 */
public class Example
{
	/*
	 * (Werte von https://software-projekt-2022.github.io/Dokumentation/#/_einleitung/projektuebersicht?id=event-bus).
	 */
	private static final String MICROSERVICE_NAME = "microservice.umwelt";
	private static final String MICROSERVICE_PREFIX = "UMW-";
	private static final String MICROSERVICE_EXCHANGE = "publish_event.umwelt";
	private static final String MICROSERVICE_QUEUE = "microservice.umwelt";

	//Verbindung und Channel für Message Bus
	private static final ConnectionFactory connectionFactory = new ConnectionFactory();
	private static Connection connection;
	private static Channel channel;

	public static void main(String[] argv) throws Exception
	{
		//Es wird eine Verbindung aufgebaut, ein Event gesendet und dann auf Events gewartet.
		createConnection();
		sendEvent(makeEvent());
		listenForEvents();
	}

	/**
	 * Funktion zum Aufbauen der Verbindung zum Message Bus.
	 */
	private static void createConnection()
	{
		//Auf localhost verbinden
		connectionFactory.setHost("localhost");
		try
		{
			//Verbindung und Channel erstellen
			connection = connectionFactory.newConnection();
			channel = connection.createChannel();
		}
		catch (IOException | TimeoutException e)
		{
			throw new RuntimeException(e);
		}
	}

	private static void sendEvent(AdminMessageBroadcastEvent event)
	{
		try
		{
			String msg = event.toString();

			//Verwendet die Exchange des Microservices und event_type als Rounting-Key
			//Sendet das Event
			channel.basicPublish(MICROSERVICE_EXCHANGE, event.event_type, null, msg.getBytes(StandardCharsets.UTF_8));
			System.out.printf("Sent event %s: \"%s\"\n", event.event_type, msg);
		}
		catch(IOException e)
		{
			throw new RuntimeException(e);
		}
	}

	/**
	 * Wird immer ausgefürt, wenn ein Event empfangen wurde.
	 */
	private static void onEventReceived(String event)
	{
		System.out.printf("Event received: \"%s\"\n", event);
	}

	/**
	 * Diese Funktion blockiert nicht und lässt das Programm im Hintergrund auf Events warten.
	 */
	private static void listenForEvents() throws IOException
	{
		//Wichtig: Parameter "autoAck" auf "true" für automatisches Acknowledgement
		channel.basicConsume(MICROSERVICE_QUEUE, true, (consumerTag, delivery) ->
		{
			//Wird immer ausgeführt, wenn ein Event empfangen wird
			String message = new String(delivery.getBody(), StandardCharsets.UTF_8);
			onEventReceived(message);
		}, consumerTag -> { });

		System.out.println("Now listening for events. Press CTRL + C to cancel.");
	}

	/**
	 * Funktion zum Erstellen eines beispielhaften Events.
	 */
	private static AdminMessageBroadcastEvent makeEvent()
	{
		AdminMessageBroadcastEvent event = new AdminMessageBroadcastEvent();
		event.message = "Das ist eine Nachricht vom Admin :)";
		return event;
	}

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
}
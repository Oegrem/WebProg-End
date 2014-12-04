import java.io.IOException;
import java.nio.ByteBuffer;

import javax.websocket.CloseReason;
import javax.websocket.EndpointConfig;
import javax.websocket.OnClose;
import javax.websocket.OnError;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

import de.fhwgt.quiz.application.Player;
import de.fhwgt.quiz.application.Quiz;
import de.fhwgt.quiz.error.QuizError;

@ServerEndpoint("/SocketServlet")
public class SocketServlet {

	@OnError
	public void error(Session session, Throwable t) {
		System.out.println("Fehler beim Öffnen des Sockets: " + t);
	}

	@OnOpen
	// Ein Client meldet sich an und eröffnet eine neue Web-Socket-Verbindung
	public void open(Session session, EndpointConfig conf) { // speichern der
																// aktuellen
																// Socket-Session
																// im
																// ConnnectionManager
		ConnectionManager.addSession(session);
		System.out.println("Open Socket mit Session-ID= " + session.getId());
		try {
			if (session.isOpen()) { // Alle Session-IDs aus Connection-Manager
									// auslesen in einem JSON-String speichern
				String output = "[";
				for (int i = 0; i < ConnectionManager.SessionCount() - 1; i++) {
					Session s = ConnectionManager.getSession(i);
					output = output + "\"" + s.getId() + "\"" + ",";
				}
				output = output
						+ "\""
						+ ConnectionManager.getSession(
								ConnectionManager.SessionCount() - 1).getId()
						+ "\"" + "]";

				// Broadcasting : JSON-String an alle Web-Socket-Verbindungen
				// senden
				for (int i = 0; i < ConnectionManager.SessionCount(); i++) {
					Session s = ConnectionManager.getSession(i);
					System.out.println(s);
					s.getBasicRemote().sendText(output, true);
				}

			}
		} catch (IOException e) {
			try {
				session.close();
			} catch (IOException e1) {
				// Ignore
			}
		}
	}

	@OnClose
	// Client meldet sich wieder ab
	public void close(Session session, CloseReason reason) { // Client aus Liste
																// entfernen
		ConnectionManager.SessionRemove(session);
		System.out.println("Close Client.");

		// Alle Session-IDs aus Connection-Manager auslesen in einem JSON-String
		// speichern
		String output = "[";
		for (int i = 0; i < ConnectionManager.SessionCount(); i++) {
			Session s = ConnectionManager.getSession(i);
			output = output + "\"" + s.getId() + "\"" + ",";
		}
		output = output
				+ "\""
				+ ConnectionManager.getSession(
						ConnectionManager.SessionCount() - 1).getId() + "\""
				+ "]";

		// Broadcasting : JSON-String an alle Web-Socket-Verbindungen senden
		for (int i = 0; i < ConnectionManager.SessionCount(); i++) {
			Session s = ConnectionManager.getSession(i);
			try {
				s.getBasicRemote().sendText(output, true);
			} catch (IOException e) {
				// ignore
			}
		}
	}

	@OnMessage
	public void receiveTextMessage(Session session, String msg, boolean last) throws IOException {
		System.out.println("Message im Server erhalten: " + msg);
		System.out.println("Server sendet Nachricht an den Client zurück");
		SocketMessage sMessage = new SocketMessage(msg);
		switch (sMessage.GetMessageType()) {
		case 1:
			QuizError loginError = new QuizError();
			Player p = Quiz.getInstance().createPlayer(((String) sMessage.GetMessage()),
					loginError);
			if (loginError.isSet()) {
				System.out.println("Login Error: Code: "
						+ Integer.toString(loginError.getStatus()));
			}
			session.getBasicRemote().sendText(new SocketMessage(2, p.getId()).GetJsonString());
			break;
		}
		
	}

	@OnMessage
	public void receiveBinaryMessage(Session session, ByteBuffer bb,
			boolean last) {
		try {
			if (session.isOpen()) {
				session.getBasicRemote().sendBinary(bb, last);
			}
		} catch (IOException e) {
			try {
				session.close();
			} catch (IOException e1) {
				// Ignore
			}
		}
	}

}

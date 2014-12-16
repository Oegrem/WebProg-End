import org.json.JSONException;
import org.json.JSONObject;

public class SocketMessage {

	private String jsonString;

	private int messageType;

	private Object[] message = new Object[6];

	public SocketMessage(String _jsonString) throws JSONException{
		jsonString = _jsonString;
		// Auslesen messageType
		JSONObject jObject;
			jObject = new JSONObject(jsonString);

			messageType = jObject.getInt("messageType");

			switch (messageType) {
			case 1:
				System.out.println("loginName empfangen: "
						+ jObject.getString("loginName"));
				message[0] = jObject.getString("loginName");
				break;
			case 5:
				System.out.println("Katalog geändert: "
						+ jObject.getString("catName"));
				message[0] = jObject.getString("catName");
				break;
			case 7:
				System.out.println("StartGame empfangen");
				break;
			case 10:
				message[0] = jObject.getLong("selection");
				break;
			}
	}

	public SocketMessage(int _messageType, Object[] _message) throws JSONException{
		messageType = _messageType;
		message = _message;
		JSONObject jObject = new JSONObject();
			jObject.put("messageType", messageType);

			switch (messageType) {
			case 2:
				jObject.put("playerId", message[0]);
				break;
			case 5:
				jObject.put("catName", message[0]);
				break;
			case 7:
				break;
			case 9:
				jObject.put("question", message[0]);
				jObject.put("answer1", message[1]);
				jObject.put("answer2", message[2]);
				jObject.put("answer3", message[3]);
				jObject.put("answer4", message[4]);
				jObject.put("timeOut", message[5]);
				break;
			case 11:
				jObject.put("timedOut", message[0]);
				jObject.put("correct", message[1]);
				break;
			case 12:
				jObject.put("isAllOver", message[0]);
				break;
			case 255:
				jObject.put("fatal", message[0]);
				jObject.put("errorMessage", message[1]);
			}
		jsonString = jObject.toString();
	}

	public String GetJsonString() {
		return jsonString;
	}

	public int GetMessageType() {
		return messageType;
	}

	public Object[] GetMessage() {
		return message;
	}
}

import org.json.JSONException;
import org.json.JSONObject;

public class SocketMessage {

	private String jsonString;

	private int messageType;

	private Object message;

	public SocketMessage(String _jsonString) {
		jsonString = _jsonString;
		// Auslesen messageType
		JSONObject jObject;
		try {
			jObject = new JSONObject(jsonString);

			messageType = jObject.getInt("messageType");

			switch (messageType) {
			case 1:
				System.out.println("loginName empfangen: "
						+ jObject.getString("loginName"));
				message = jObject.getString("loginName");
				break;
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			System.out.println("JSON translate error");
			e.printStackTrace();
		}
	}

	public SocketMessage(int _messageType, Object _message) {
		messageType = _messageType;
		message = _message;
		JSONObject jObject = new JSONObject();
		try {
			jObject.put("messageType", messageType);

			switch (messageType) {
			case 2:
				jObject.put("playerId", message);
				break;
			}
		} catch (JSONException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
		jsonString = jObject.toString();
	}

	public String GetJsonString() {
		return jsonString;
	}

	public int GetMessageType() {
		return messageType;
	}

	public Object GetMessage() {
		return message;
	}
}

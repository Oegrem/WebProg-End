import java.io.IOException;
import java.util.TimerTask;

import javax.websocket.Session;

import org.json.JSONException;

import de.fhwgt.quiz.application.Player;
import de.fhwgt.quiz.application.Quiz;
import de.fhwgt.quiz.error.QuizError;


public class Timer extends TimerTask {
	
	private Session tSession;
	
	private Player tPlayer;	
	
	public Timer(Player _tPlayer, Session _tSession) {
		tPlayer = _tPlayer;
		tSession = _tSession;
	}
	
	@Override
	public void run() {
		// TODO Auto-generated method stub
		System.out.println("Time Out!");
		try {
			QuizError qError = new QuizError();
			try {
				tSession.getBasicRemote().sendText(
						new SocketMessage(11, new Object[] { true, Quiz.getInstance().answerQuestion(tPlayer, -1, qError) })
								.GetJsonString());
			} catch (JSONException e) {
				// TODO Auto-generated catch block
				SocketHandler.sendError(tSession, 0, "Erstellen der TimeOut Message fehlgeschlagen!");
				e.printStackTrace();
			}
			if(qError.isSet()){
				System.out.println("TimeOut Answer Error: "+qError.getDescription());
			}
		} catch (IOException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}
	}

}

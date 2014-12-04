import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import de.fhwgt.quiz.application.Player;
import de.fhwgt.quiz.application.Quiz;

@WebServlet("/SSEServlet")
public class SSEServlet extends HttpServlet {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	private Quiz quiz;

	public SSEServlet() {
		quiz = Quiz.getInstance();
	}

	/**
	 * @see HttpServlet#doGet(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {

		// cache abstellen
		response.setHeader("pragma", "no-cache,no-store");
		response.setHeader("cache-control",
				"no-cache,no-store,max-age=0,max-stale=0");

		// Protokoll auf Server Sent Events einstellen
		response.setContentType("text/event-stream;charset=UTF-8");

		PrintWriter pw = response.getWriter();
		boolean isConnected = true;
		while (isConnected) {
			String playerList = "";
			for(Player pTemp : quiz.getPlayerList()){
				playerList += "{\"name\":\""+pTemp.getName()+"\",\"score\":"+Long.toString(pTemp.getScore())+"},";
			}
			if(playerList != ""){
			playerList = playerList.substring(0, playerList.length()-1);
			pw.print("data: {\"playerList\":["+playerList+"]} \n\n");
			pw.flush();
			}
			if (pw.checkError()) {
				isConnected = false;
			}
			quiz.waitPlayerChange();
		}
	}

	/**
	 * @see HttpServlet#doPost(HttpServletRequest request, HttpServletResponse
	 *      response)
	 */
	protected void doPost(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		doGet(request, response);
	}

}

<!DOCTYPE html>
<%@page import="de.fhwgt.quiz.loader.FilesystemLoader"%>
<%@page import="javax.websocket.Session"%>
<html lang="en">
<head>
<script src="javaScript_jsp.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="stylesheet_jsp.css">
<%@page
	import="java.util.*, java.util.Map, de.fhwgt.quiz.application.*, de.fhwgt.quiz.error.*"%>

<%
String startShow = "hidden";
	Quiz quiz = Quiz.getInstance();
	QuizError quizError = new QuizError();

	Map<String, Catalog> cMap;

	String username = request.getParameter("username");
	if (username != null) {
		Player pl = quiz.createPlayer(username, quizError);
		if(quiz.getPlayerList().size() >= 3){
			startShow = "visible";
		}
	}
	FilesystemLoader cLoader = new FilesystemLoader("Catalogs");
	quiz.initCatalogLoader(cLoader);

	cMap = quiz.getCatalogList();
%>


<title>WebProg Quiz</title>
<meta charset="utf-8">
<meta name="description" content="WebPog Quiz">
<meta name="author" content="Tobias">
</head>
<body>
	<header>
		<div id="titel">
			<h1 id="laufSchrift">WebProg Quiz</h1>
		</div>
	</header>
	<div id="center">
		<div id="main">
			<div id="login">
				Username<br />
				<form>
					<input name="username" type="text" maxlength="140" id="inputBox"
						value=""><br /> <input type="submit" id="loginButton"
						value="LogIn" />
				</form>
				<input style="visibility: <%= startShow %>" type="submit" value="Start" id="startButton" />
			</div>
		</div>
		<div id="control">
			<div id="top-control">
				<h2>
					<img src="WebProgPic/katalog.png" alt=""> Kataloge
				</h2>
				<%
					for (Map.Entry<String, Catalog> cEntry : cMap.entrySet()) {
						String cName = cEntry.getKey();
						out.print("<div class='button'>"+cName.substring(0, cName.indexOf('.'))+"</div>");

					}
				%>
			</div>
			<div id="bot-control">
				<h2>
					<img src="WebProgPic/highscore.png" alt=""> Highscore
				</h2>
				<table id="table1">
					<thead>
						<tr>
							<td>Player
								<hr />
							</td>
							<td>Score
								<hr />
							</td>
						</tr>
					</thead>
					<tbody>
						<%
							for (Player player : quiz.getPlayerList()) {
								out.print("<tr><td>" + player.getName().replace('<', ' ') + "</td><td>"
										+ Long.toString(player.getScore()) + "</td></tr>");
							}
						%>
					</tbody>
				</table>
			</div>
		</div>
	</div>
	<footer>
		<p>&Dagger; Footer &Dagger;</p>
	</footer>
</body>
</html>

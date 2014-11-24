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
<%@include file="main.jsp" %>
<div id="control">
<%@include file="catalogs.jsp"  %>
<%@include file="highscore.jsp"  %>
</div>
	</div>
	<footer>
		<p>&Dagger; Footer &Dagger;</p>
	</footer>
</body>
</html>

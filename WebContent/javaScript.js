/**
 * @author Tobias
 */
document.addEventListener("DOMContentLoaded", init, false);

var activeCatalog = "";

var request;

var socket;
var readyToSend = false;

var playerId = -1;

var curQuestion = "";
var curAnswer1 = "";
var curAnswer2 = "";
var curAnswer3 = "";
var curAnswer4 = "";
var curTimeOut = 0;

var curSelection = -1;

var curPlayerList;

var isQuestionActive = false;

function ajaxServerResponse() {
	if (request.readyState == 4) {
		var answer = request.responseXML.getElementsByTagName("katalogName");
		for (var i = 0; i < answer.length; i++) {
			var newButton = document.createElement("div");
			newButton.className = "button";
			newButton.textContent = answer[i].firstChild.nodeValue;
			document.getElementById("top-control").appendChild(newButton);
			newButton.addEventListener("mouseover", hoverButton, false);
			newButton.addEventListener("mouseleave", leaveButton, false);
			newButton.addEventListener("click", clickButton, false);
			newButton.isChosen = false;
		}
	}
}

function loadCatalog() {
	request = new XMLHttpRequest();

	request.onreadystatechange = ajaxServerResponse;
	request.open("GET", "AjaxServlet", true);

	request.send(null);
}

function sseDataListener(event) {
	var playerList = JSON.parse(event.data).playerList;
	var table = document.getElementById("table1").getElementsByTagName("tbody")[0];
	while (table.firstChild) {
		table.removeChild(table.firstChild);
	}
	playerList.sort(function(a, b) {
		return b.score-a.score;
	});
	curPlayerList = playerList;
	for (var i = 0; i < playerList.length; i++) {
		var row = table.insertRow();

		var cellPlayer = row.insertCell();
		cellPlayer.textContent = playerList[i].name;

		var cellScore = row.insertCell();
		cellScore.textContent = playerList[i].score;
	}
	var sButton = document.getElementById("startButton");
	if (sButton != null) {
		if (playerId == 0) {
			if (playerList.length > 1 && sButton.disabled) {
				sButton.disabled = false;
				sButton.style.fontSize = "20px";
				sButton.textContent = "Start";
			}
			if (playerList.length < 2 && sButton.disabled == false) {
				sButton.disabled = true;
				sButton.style.fontSize = "16px";
				sButton.textContent = "Warte auf weitere Spieler...";
			}
		}
	}
}

function socketReceive(message) {
	var sMessage = JSON.parse(message.data);
	console.log(message);
	console.log(sMessage.messageType);
	switch (sMessage.messageType) {
	case 2:
		console.log("Player ID: " + sMessage.playerId);
		playerId = sMessage.playerId;
		login();
		break;
	case 5:
		console.log("Cat changed: " + sMessage.catName);
		activeCatalog = sMessage.catName;
		chooseCatalog(activeCatalog);
		break;
	case 7:
		showGameDiv();
		socketSend(8);
		break;
	case 9:
		curQuestion = sMessage.question;
		curAnswer1 = sMessage.answer1;
		curAnswer2 = sMessage.answer2;
		curAnswer3 = sMessage.answer3;
		curAnswer4 = sMessage.answer4;
		curTimeOut = sMessage.timeOut;
		showQuestion();
		isQuestionActive = true;
		break;
	case 11:
		console.log("Correct: " + sMessage.correct);
		
		document.getElementById(curSelection).style.borderColor = "red";
		document.getElementById(curSelection).style.backgroundColor = "#FF0800";
		
		document.getElementById(sMessage.correct).style.borderColor = "green";
		document.getElementById(sMessage.correct).style.backgroundColor = "#8DB600";
				
		isQuestionActive = false;
		window.setTimeout(function() {
			socketSend(8);
		}, 2000)
		break;
	case 12:
		console.log("Spiel ende!");
		GameOver(sMessage);
		break;
	case 255:
		if(sMessage.fatal == 1){
		ErrorBlinken(sMessage.errorMessage);
		}else{
			console.log("Warning: "+sMessage.errorMessage);
		}
		break;
	default:
		break;
	}
}

function socketSend(type) {
	if (readyToSend == true) {
		// Senden
		var messageType = type;
		var jsonSend;
		var selection = curSelection;
		switch (messageType) {
		case 1:
			var loginName = document.getElementById("inputBox").value;
			jsonSend = JSON.stringify({
				messageType : messageType,
				loginName : loginName
			});
			break;
		case 5:
			var catName = activeCatalog;
			jsonSend = JSON.stringify({
				messageType : messageType,
				catName : catName
			});
			break;
		case 7:
			jsonSend = JSON.stringify({
				messageType : messageType
			});
			break;
		case 8:
			jsonSend = JSON.stringify({
				messageType : messageType
			});
			break;
		case 10:
			jsonSend = JSON.stringify({
				messageType : messageType,
				selection : selection
			});
			break;
		default:
			break;
		}

		socket.send(jsonSend);
	}
}

function init() {
	var buttons = document.getElementsByClassName("button");

	var url = 'ws://localhost:8080/WebServlet/SocketHandler';
	socket = new WebSocket(url);

	socket.onopen = function() {
		readyToSend = true;
	}

	socket.onerror = function(event) {
		alert("Fehler bei den Websockets " + event.data);
	}

	socket.onclose = function(event) {
		console.log("Websockets closing " + event.code);
	}

	socket.onmessage = socketReceive;

	for (var c = 0; c < buttons.length; c++) {
		buttons[c].addEventListener("mouseover", hoverButton, false);
		buttons[c].addEventListener("mouseleave", leaveButton, false);
		buttons[c].addEventListener("click", clickButton, false);
		buttons[c].isChosen = false;
	}

	var loginButton = document.getElementById("loginButton");

	loginButton.addEventListener("click", function() {
		socketSend(1);
	}, false);

	document.getElementById("table1").getElementsByTagName("tbody")[0]
			.addEventListener("mousedown", tableClickListener, false);
	loadCatalog();

	laufSchrift();

	var source = new EventSource("SSEServlet");
	source.addEventListener('message', sseDataListener, false);
	source.addEventListener('open', function() {
		console.log("SSE Opened!");
	}, false);
	source.addEventListener('error', function() {
		if (event.eventPhase == EventSource.CLOSED) {
			console.log("Error: Connection Closed");
		} else
			console.log("Error: SSE");
	}, false);

}

function laufSchrift() {
	var paddLeft = 0;
	var paddBot = 0;
	var titel = document.getElementById("laufSchrift");
	var interval = 10;
	var rise = 5;
	window.setInterval(function() {
		paddLeft += interval;
		paddBot += rise;
		if (paddLeft >= document.getElementById("titel").offsetWidth - 240
				|| paddLeft <= 0) {
			interval *= -1;
		}

		if (paddBot >= 20 || paddBot <= 0) {
			rise *= -1;
			switch (Math.floor(Math.random() * 5)) {
			case 0:
				titel.style.color = "red";
				break;
			case 1:
				titel.style.color = "blue";
				break;
			case 2:
				titel.style.color = "green";
				break;
			case 3:
				titel.style.color = "yellow";
				break;
			case 4:
				titel.style.color = "purple";
				break;

			}
		}
		titel.style.paddingLeft = paddLeft + "px";
		titel.style.paddingTop = paddBot + "px";
	}, 50);

}

function GameOver(ranking) {
	var questDiv = document.getElementById("questDiv");
	while (questDiv.firstChild) {
		questDiv.removeChild(questDiv.firstChild);
	}
	var title = document.createElement("h3");
	title.textContent = "Game Over!";
	questDiv.appendChild(title);
	if(ranking.isAllOver){
		for (var i = 0; i < curPlayerList.length; i++) {
			var p = document.createElement("h2");
			p.textContent = "Platz "+(i+1)+": "+curPlayerList[i].name+" "+curPlayerList[i].score;
			questDiv.appendChild(p);
		}
	}else{
		var p = document.createElement("p");
	p.textContent = "Warte bis alle Spieler fertig sind...";
	questDiv.appendChild(p);
	}
	
	
}

function login() {
	var loginDiv = document.getElementById("login");
	loginDiv.removeChild(document.getElementById("inputBox"));
	loginDiv.removeChild(document.getElementById("loginButton"));
	loginDiv.textContent = "";
	var startButton = document.createElement("button");
	startButton.id = "startButton";
	startButton.disabled = true;
	startButton.addEventListener("click", StartButtonClick, false);
	if (playerId == 0) {
		startButton.textContent = "Warte auf weitere Spieler...";
	} else {
		startButton.textContent = "Warte auf Start durch Spielleiter...";
	}

	loginDiv.appendChild(startButton);

}

function hoverButton(event) {
	var button = event.target;
	if (button.isChosen != true) {
		button.style.backgroundColor = "green";
	}
}

function leaveButton(event) {
	var button = event.target;
	if (button.isChosen != true) {
		button.style.backgroundColor = "#c4c4c4";
	}
}

function clickButton(event) {
	var button = event.target;
	if (playerId == 0) {
		if (button.isChosen != true) {
			chooseCatalog(button.textContent);
			socketSend(5);
		}
	}
}

function chooseCatalog(catName) {
	var buttons = document.getElementsByClassName("button");
	for (var c = 0; c < buttons.length; c++) {
		if (buttons[c].isChosen == true) {
			buttons[c].style.backgroundColor = "#c4c4c4";
			buttons[c].style.border = "none";
			buttons[c].style.fontWeight = "normal";
			buttons[c].isChosen = false;
		}
		if (buttons[c].textContent == catName) {
			buttons[c].style.backgroundColor = "yellow";
			buttons[c].style.border = "groove";
			buttons[c].style.borderColor = "blue";
			buttons[c].style.fontWeight = "bold";
			buttons[c].isChosen = true;
			activeCatalog = buttons[c].textContent;
		}
	}
}

function showGameDiv() {
	var mainDiv = document.getElementById("main");
	mainDiv.removeChild(document.getElementById("login"));
	var questDiv = document.createElement("div");
	var question = document.createElement("div");
	question.id = "QuestionText";
	question.style.fontSize = "16px";

	questDiv.id = "questDiv";

	var title = document.createElement("h3");
	title.id = "GameDivTitle";
	title.textContent = "Fragekatalog: " + activeCatalog;
	questDiv.appendChild(title);
	questDiv.appendChild(question);

	var answers = [];

	for (var c = 0; c < 4; c++) {
		answers[c] = document.createElement("div");
		answers[c].className = "answerDiv";
		answers[c].id = c;
		answers[c].addEventListener("mouseover", function(event) {
			if (isQuestionActive) {
				event.target.style.borderColor = "red";
				event.target.style.backgroundColor = "#FF3333";
			}
		}, false);
		answers[c].addEventListener("mouseleave", function(event) {
			if (isQuestionActive) {
				event.target.style.borderColor = "black";
				event.target.style.backgroundColor = "white";
			}
		}, false);
		answers[c].addEventListener("click", function(event) {
			if (isQuestionActive) {
				curSelection = event.target.id;
				console.log("clicked: " + event.target.id);
				socketSend(10);
			}
		}, false);
		questDiv.appendChild(answers[c]);
	}
	var timeOut = document.createElement("p");
	timeOut.id = "timeOut";
	questDiv.appendChild(timeOut);
	mainDiv.appendChild(questDiv);
}

function showQuestion() {

	document.getElementById("QuestionText").textContent = curQuestion;

	var answerText = [ curAnswer1, curAnswer2, curAnswer3, curAnswer4 ];

	var answers = document.getElementsByClassName("answerDiv");
	for (var c = 0; c < 4; c++) {
		answers[c].style.borderColor = "black";
		answers[c].style.backgroundColor = "white";
		answers[c].textContent = answerText[c];
	}
	document.getElementById("timeOut").textContent = "Time Out: " + curTimeOut
			+ " Sekunden";
}

function StartButtonClick(event) {
	if (playerId == 0) {
		var catalogs = document.getElementsByClassName("button");
		if (activeCatalog == "") {
			ErrorBlinken("Kein Katalog ausgew�hlt!");
		} else {
			socketSend(7);
		}
	}
}

function tableClickListener(event) {
	var row = event.target.parentNode;
	var body = row.parentNode;
	if (row !== body.firstChild) {
		body.removeChild(row);
		body.insertBefore(row, body.firstChild);
	}
}

function ErrorBlinken(errorMessage) {
	var errorDiv = document.createElement("div");
	errorDiv.id = "errorDiv";
	errorDiv.textContent = errorMessage;
	document.getElementById("center").appendChild(errorDiv);
	// Rechnung zum horizontalen zentrieren des errorDivs
	var marginLeft = (document.getElementById("center").offsetWidth - errorDiv.offsetWidth)
			/ document.getElementById("center").offsetWidth * 100 / 2;
	errorDiv.style.marginLeft = marginLeft + "%";
	document.getElementsByTagName("body")[0].style.backgroundColor = "red";
	var blinkFrequency = 400;
	for (var i = 1; i < 4; i += 2) {
		window
				.setTimeout(
						function() {
							document.getElementsByTagName("body")[0].style.backgroundColor = "#ccd2ff";
						}, blinkFrequency * i);
		window
				.setTimeout(
						function() {
							document.getElementsByTagName("body")[0].style.backgroundColor = "red";
						}, blinkFrequency * (i + 1));
		window
				.setTimeout(
						function() {
							document.getElementsByTagName("body")[0].style.backgroundColor = "#ccd2ff";
						}, blinkFrequency * (i + 2));
	}
	window.setTimeout(function() {
		document.getElementById("center").removeChild(
				document.getElementById("errorDiv"));
	}, blinkFrequency * 5);
}

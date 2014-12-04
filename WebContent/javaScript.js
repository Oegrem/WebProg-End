/**
 * @author Tobias
 */
document.addEventListener("DOMContentLoaded", init, false);

var request;

var socket;
var readyToSend = false;

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
	console.log(playerList);
	var table = document.getElementById("table1").getElementsByTagName("tbody")[0];
	while(table.firstChild){
		table.removeChild(table.firstChild);
	}
	for (var i = 0; i < playerList.length; i++) {
		var row = table.insertRow();

		var cellPlayer = row.insertCell();
		cellPlayer.textContent = playerList[i].name;

		var cellScore = row.insertCell();
		cellScore.textContent = playerList[i].score;
	}
}

function socketReceive(message) {
	var sMessage = JSON.parse(message.data);
	console.log(message);
	console.log(sMessage.messageType);
	switch (sMessage.messageType) {
	case 2:
		console.log("Player ID: "+sMessage.playerId);
		break;
	default:
		break;
	}
}

function socketSend() {
	if (readyToSend == true) {
		// Senden
		var messageType = 1;
		var loginName = document.getElementById("inputBox").value;
		
		var jsonSend = JSON.stringify({messageType:messageType, loginName:loginName});
		socket.send(jsonSend);
	}
}

function init() {
	var buttons = document.getElementsByClassName("button");

	var url = 'ws://localhost:8080/WebServlet/SocketServlet';
	socket = new WebSocket(url);

	socket.onopen = function() {
		readyToSend = true;
	}

	socket.onerror = function(event) {
		alert("Fehler bei den Websockets " + event.data);
	}

	socket.onclose = function(event) {
		alert("Websockets closing " + event.code);
	}

	socket.onmessage = socketReceive;

	for (var c = 0; c < buttons.length; c++) {
		buttons[c].addEventListener("mouseover", hoverButton, false);
		buttons[c].addEventListener("mouseleave", leaveButton, false);
		buttons[c].addEventListener("click", clickButton, false);
		buttons[c].isChosen = false;
	}

	var loginButton = document.getElementById("loginButton");

	loginButton.addEventListener("click", socketSend, false);

	document.getElementById("table1").getElementsByTagName("tbody")[0]
			.addEventListener("mousedown", tableClickListener, false);
	loadCatalog();
	var startButton = document.getElementById("startButton");

	startButton.addEventListener("click", StartButtonClick, false);

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
	if (button.isChosen != true) {
		var buttons = document.getElementsByClassName("button");
		for (var c = 0; c < buttons.length; c++) {
			if (buttons[c].isChosen == true) {
				buttons[c].style.backgroundColor = "#c4c4c4";
				buttons[c].style.border = "none";
				buttons[c].style.fontWeight = "normal";
				buttons[c].isChosen = false;
			}
		}
		button.style.backgroundColor = "yellow";
		button.style.border = "groove";
		button.style.borderColor = "blue";
		button.style.fontWeight = "bold";
		button.isChosen = true;
	} else {
		button.style.backgroundColor = "green";
		button.style.border = "none";
		button.style.fontWeight = "normal";
		button.isChosen = false;
	}
}

function StartButtonClick(event) {
	var catalogs = document.getElementsByClassName("button");
	var activeCatalog;
	var isChosen = false;
	for (var c = 0; c < catalogs.length; c++) {
		if (catalogs[c].isChosen == true) {
			activeCatalog = catalogs[c].textContent;
			isChosen = true;
		}
	}
	if (isChosen == false) {
		ErrorBlinken("Kein Katalog ausgew�hlt!");
	} else {
		var mainDiv = document.getElementById("main");
		mainDiv.removeChild(document.getElementById("login"));
		var questDiv = document.createElement("div");
		var question = document.createElement("div");
		question.style.fontSize = "16px";

		questDiv.id = "questDiv";
		question.textContent = "Frage1: Welcher Mechanismus kann unter Unix zur Kommunikation �ber das Netzwerk verwendet werden?";

		var title = document.createElement("h3");
		title.textContent = "Fragekatalog: " + activeCatalog;
		questDiv.appendChild(title);
		questDiv.appendChild(question);
		var answerText = [ "Pipes", "Semaphore", "Sockets (Richtig)",
				"Message Queues" ];

		var answers = new Array();
		for (var c = 0; c < 4; c++) {
			answers[c] = document.createElement("div");
			answers[c].className = "answerDiv";
			answers[c].textContent = answerText[c];
			questDiv.appendChild(answers[c]);
		}
		mainDiv.appendChild(questDiv);
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

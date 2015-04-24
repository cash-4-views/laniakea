
document.getElementById("btn").addEventListener("click", sendNotification);

function sendNotification(data) {
	"use strict";
	var xhr = new XMLHttpRequest();
	xhr.open("GET", "/notify");
	xhr.send();
}


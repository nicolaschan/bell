
// const UI = require(origin + "UIManager.js");
// const Cookies = require(origin + "CookieManager.js");
// const Classes = require(origin + "ClassesManager.js");
// const BellTimer = require(origin + "BellTimer.js");
const $ = require("jquery"); // forgive my inconsitent usage of jquery

var logger = new (require("../js/SimpleLogger.js"))();

var c = document.getElementById("circle");
var ctx = c.getContext('2d');

c.height = document.body.clientHeight - 20;
c.width = c.height;

var updateGraphics = function() {
	ctx.fillStyle = "black";
	ctx.beginPath();
	ctx.arc(c.width / 2, c.height / 2, c.width / 2, 0, 2 * Math.PI);
	ctx.fill();
	ctx.strokeStyle = "black";
	ctx.stroke();
	handle = window.requestAnimationFrame(updateGraphics);
};

var handle; // apparently not supported by jquery
/*
http://stackoverflow.com/questions/8894461/updating-an-extension-button-dynamically-inspiration-required
*/

document.addEventListener('DOMContentLoaded', function() {
	c.style.visibility = 'visible';
	$("#canvas").show();
	console.log("initialized");
	document.addEventListener('keypress', () => console.log("hi"));
	handle = window.requestAnimationFrame(updateGraphics);
}, false);
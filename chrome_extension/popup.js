
// Local dependencies
const UI = require("../js/UIManager.js");
const CookieManager = require("../js/CookieManager.js");
const ClassesManager = require("../js/ClassesManager.js");
const BellTimer = require("../js/BellTimer.js");
const SimpleLogger = require("../js/SimpleLogger.js");
const ThemeManager = require("../js/ThemeManager.js");
const Interval = require("../js/IntervalManager.js");
// Modules
const $ = require("jquery"); // forgive my inconsitent usage of jquery
const Cookies = require('js-cookie');

var logger = new (require("../js/SimpleLogger.js"))();
logger.setLevel('warn');
var cookman = new CookieManager(Cookies);
var thememan = new ThemeManager(cookman);
var classes = new ClassesManager(cookman);
var bellTimer = new BellTimer(classes);

var c = document.getElementById("circle");
var ctx = c.getContext('2d');

var side = document.body.clientHeight - 40;

c.height = c.width = side;

/**
 * A slightly optimized version of the same method found in UIManager.js, accounting for the fact that
 * as a Chrome extension popup, the canvas should never be resized.
 */
var updateGraphics = function() {
    var time = bellTimer.getTimeRemainingString();
    var color = thememan.getCurrentTheme()(time)[1];
    var proportion = bellTimer.getProportionElapsed();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = side / 15;

    var radius = (side / 2) * 0.95;
    var posX = side / 2;
    var posY = side / 2;

    ctx.beginPath();
    ctx.arc(posX, posY, radius, (Math.PI / -2), (Math.PI / -2) + (-2 * Math.PI) * (1 - proportion), true);
    ctx.lineTo(posX, posY);
    ctx.closePath();
    ctx.fill();

    handle = window.requestAnimationFrame(updateGraphics);
};

var handle; // apparently not supported by jquery
/*
http://stackoverflow.com/questions/8894461/updating-an-extension-button-dynamically-inspiration-required
*/

var initializePopup = function() {
	handle = window.requestAnimationFrame(updateGraphics);
};

document.addEventListener('DOMContentLoaded', function() {
	bellTimer.initializeFromHost("https://bell.lahs.club", initializePopup);
}, false);
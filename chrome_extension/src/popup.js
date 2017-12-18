// Local dependencies
const ChromeCookieManagerFactory = require("./ChromeCookieManager2.js");
const BellTimer = require("../../src/BellTimer.js");
const ThemeManager = require("../../src/ThemeManager.js");
const RequestManager = require("../../src/RequestManager.js");
const ExtUI = require('./ExtUI.js');
const ExtUIModel = require('./ExtUIModel.js');
const hostname = 'http://localhost:8005';//https://countdown.zone';

var cookman;
var thememan;
var reqman;
var bellTimer;
var handle;
var extUIModel; 
var extUI;

const beta = false;

var setup = function() {
    global.cookman = cookman;
    global.bellTimer = bellTimer;
    var updateAll = function() {
        extUI.redraw();
        handle = window.requestAnimationFrame(updateAll);
    };
    handle = window.requestAnimationFrame(updateAll);
};

var initializePopup = async function() {
    thememan = new ThemeManager(cookman);
    reqman = new RequestManager(cookman, hostname);
    bellTimer = new BellTimer(cookman, reqman);
    extUIModel = new ExtUIModel(bellTimer, cookman, thememan, reqman);
    extUI = new ExtUI(extUIModel);
    global.cookman = cookman;
    global.bellTimer = bellTimer;

    /*var c = document.getElementById("circle");
    var ctx = c.getContext('2d');
    var side = 400;
    c.height = c.width = side;*/

    extUIModel.setLoadingMessage('Synchronizing');
    await bellTimer.initialize();
    extUIModel.initialize();
    setup();
};

var somethingWentWrong = function(err) {
    var c = document.getElementById("circle");
    var ctx = c.getContext('2d');
    ctx.fillStyle = "red";
    ctx.font = "18px Roboto";
    ctx.fillText("Something went really wrong.", 0, 20);
    ctx.fillText("Whoops.", 0, 40);
};
/*
window.onload = function() {
    var ld = document.getElementById("page1");
    // Apparently this depends on the browser?
    // Mozilla says Chrome uses "transitioned", but apparently mine doesn't.
    ld.addEventListener("webkitTransitionEnd", function(event) {
        hideLoading();
    });
    ld.addEventListener("transitioned", function(event) {
        hideLoading();
    });
};*/

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // not supposed to be https
        cookman = await ChromeCookieManagerFactory();
        initializePopup();
    } catch (e) {
        somethingWentWrong();
        console.log(e.stack);
    }
}, false);
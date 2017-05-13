
// Local dependencies
// Note that CookieManager.js cannot be used because the chrome.cookies API is needed
// to access cookies from this extension.
const ChromeCookieManager = require("./ChromeCookieManager.js");
const ClassesManager = require("../js/ClassesManager.js");
const BellTimer = require("../js/BellTimer.js");
const ThemeManager = require("../js/ThemeManager.js");
// Modules
const $ = require("jquery"); // forgive my inconsitent usage of jquery
const _ = require("lodash"); // must use this instead of js-cookie because this isn't the website

var cookman;
var thememan;
var classes;
var bellTimer;
var handle;

var updateColors;
var updateAll;
var dynamicallySetFontSize;

const beta = false;

var setup = function() {
    // bellTimer.enableDevMode(new Date('2017-05-12 8:00'), 60);
    var c = document.getElementById("circle");
    var ctx = c.getContext('2d');

    var side = 400;

    c.height = c.width = side;

    var offline = typeof timesync == 'undefined'; // returns false if timesync is not initialized

    // Most of the below code is modified from UIManager.js
    var helpers = {
        updateTitle: _.throttle(function(text) {
            $('head title').text(text);
        }, 500, {
          leading: true
        })
    };

    var update = function() {
        var time = bellTimer.getTimeRemainingString();
        var name = bellTimer.getCurrentPeriod().name;
        var schedule = bellTimer.getCurrentSchedule();
        var proportionElapsed = bellTimer.getProportionElapsed();
        $('#time').text(time);
        helpers.updateTitle(time);
        $('#subtitle').text(name);
        $('#scheduleName').text(schedule.displayName);
        $('#countdown').css('opacity', 1);
    };

    /**
     * Updates the colors of the extension.
     */
    updateColors = function() {
        var time = bellTimer.getTimeRemainingString();
        var schedule = bellTimer.getCurrentSchedule();
        var color = schedule.color;
        var theme = thememan.getCurrentTheme();
        var themeName = thememan.getCurrentThemeName();
        $('#time').css('color', theme(time)[0]);
        $('.subtitle').css('color', theme(time)[1]);
        $('#page1').css('background-color', theme(time)[2]);
        if (color) {
            if (themeName == 'Default - Dark')
                $('#time').css('color', color);
            if (themeName == 'Default - Light')
                $('#page1').css('background-color', color);
        }
    };

    /**
     * Redraws the circle.
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
    };

    updateAll = function() {
        update();
        updateGraphics();
        updateColors();
        handle = window.requestAnimationFrame(updateAll);
    }

    dynamicallySetFontSize = function() {
        $('#time').css('font-size', (Math.min($(window).innerHeight() * 0.3, $(window).innerWidth() * 0.2)) + 'px');
        $('.subtitle').css('font-size', (Math.min($(window).innerHeight() * 0.07, $(window).innerWidth() * 0.07)) + 'px');
    };

    /*
    http://stackoverflow.com/questions/8894461/updating-an-extension-button-dynamically-inspiration-required
    */
    $(window).on('load resize', dynamicallySetFontSize);
    dynamicallySetFontSize();
    updateColors();
    handle = window.requestAnimationFrame(updateAll);
}

var initializePopup = function() {
    thememan = new ThemeManager(cookman);
    classes = new ClassesManager(cookman);
    bellTimer = new BellTimer(classes, cookman);
    bellTimer.initializeFromHost("https://bell" + (beta ? "-beta" : "") + ".lahs.club", setup);
};

var somethingWentWrong = function(err) {
    var c = document.getElementById("circle");
    var ctx = c.getContext('2d');
    ctx.fillStyle = "red";
    ctx.font = "18px Roboto";
    ctx.fillText("Something went really wrong.", 0, 20);
    ctx.fillText("Whoops.", 0, 40);
}

var setLoadingMessage = function(message) {
    $('.loading').show();
    $('#loadingMessage').text(message);
};

/**
 * Some janky animation thing.
 */
var hideLoading = function() {
    var ld = document.getElementsByClassName("loading")[0];
    var op = window.getComputedStyle(ld).getPropertyValue("opacity");
    ld.style.opacity = op;
    var inc = op / 8;
    var fade = function() {
        if(ld.style.opacity <= 0) {
            $(".loading").hide();
            return;
        }
        ld.style.opacity -= inc;
        smallHandle = requestAnimationFrame(fade);
    };
    var smallHandle = requestAnimationFrame(fade);
};

window.onload = function() {
    setLoadingMessage("Loading...");
    var ld = document.getElementById("countdown");
    // Apparently this depends on the browser?
    // Mozilla says Chrome uses "transitioned", but apparently mine doesn't.
    ld.addEventListener("webkitTransitionEnd", function(event) {
        hideLoading();
    });
    ld.addEventListener("transitioned", function(event) {
        hideLoading();
    });
};

document.addEventListener('DOMContentLoaded', function() {
    try {
        /*$("#icons").on("mouseenter",
            function(ev) {
                console.log("hi");
                $("#settingsIcon").toggle();
        });
        console.log(gear);*/              // not supposed to be https
        cookman = new ChromeCookieManager("http://bell" + (beta ? "-beta" : "") + ".lahs.club", initializePopup);
    }
    catch(e) {
        somethingWentWrong();
        console.log(e.stack);
    }
}, false);
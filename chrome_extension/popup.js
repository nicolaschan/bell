
// Local dependencies
// Note that CookieManager.js cannot be used because the chrome.cookies API is needed
// to access cookies from this extension.
const ChromeCookieManager = require("./ChromeCookieManager.js");
const ClassesManager = require("../js/ClassesManager.js");
const BellTimer = require("../js/BellTimer.js");
const SimpleLogger = require("../js/SimpleLogger.js");
const ThemeManager = require("../js/ThemeManager.js");
// Modules
const $ = require("jquery"); // forgive my inconsitent usage of jquery
const _ = require("lodash"); // must use this instead of js-cookie because this isn't the website

var logger = new (require("../js/SimpleLogger.js"))();
logger.setLevel('warn');

var cookman;
var thememan;
var classes;
var bellTimer;
var handle;

var updateColors;
var updateAll;
var dynamicallySetFontSize;

var setup = function() {
    var c = document.getElementById("circle");
    var ctx = c.getContext('2d');

    var side = document.body.clientHeight - 40;

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
        var min = parseInt(time.split(':')[time.split(':').length - 2]) + (parseInt(time.split(':')[time.split(':').length - 1]) / 60);
        if (time.split(':').length > 2)
            min = 60;
        if (min < 2) {
            $('#favicon').attr('href', '../favicons/red.png?v=1');
        } else if (min < 5) {
            $('#favicon').attr('href', '../favicons/orange.png?v=1');
        } else if (min < 15) {
            $('#favicon').attr('href', '../favicons/yellow.png?v=1');
        } else {
            $('#favicon').attr('href', '../favicons/lime.png?v=1');
        }
        $('#countdown').css('opacity', 1);
    };

    /**
     * Updates the colors of the extension. Should only be called once upon initialization, since unlike
     * the full web version, the theme cookie should not change while the extension is open.
     */
    updateColors = function() {
        var time = bellTimer.getTimeRemainingString();
        var schedule = bellTimer.getCurrentSchedule();
        var color = schedule.color;
        var theme = thememan.getCurrentTheme();
        $('#time').css('color', theme(time)[0]);
        $('.subtitle').css('color', theme(time)[1]);
        $('#page1').css('background-color', theme(time)[2]);
        if (color) {
            if (currentTheme == 'Default - Dark')
                $('#time').css('color', color);
            if (currentTheme == 'Default - Light')
                $('#page1').css('background-color', color);
        }
    };

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
    };

    updateAll = function() {
        update();
        updateGraphics();
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
    bellTimer = new BellTimer(classes);
    bellTimer.initializeFromHost("https://bell.lahs.club", setup);
};

document.addEventListener('DOMContentLoaded', function() {
    try {
                                            // yes, http not https
        cookman = new ChromeCookieManager("http://bell.lahs.club/", initializePopup);
    }
    catch(e) {
        var c = document.getElementById("circle");
        var ctx = c.getContext('2d');
        ctx.fillStyle = "red";
        ctx.font = "12px Roboto";
        ctx.fillText("Something went really wrong.", 0, 0);
        ctx.fillText("Whoops.", 0, 15);
    }
}, false);
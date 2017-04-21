const _ = require('lodash');
const $ = require('jquery');

(function() {

  var helpers = {
    updateTitle: _.throttle(function(text) {
      $('head title').text(text);
    }, 500, {
      leading: true
    })
  };

  var self;

  var UIManager = function(bellTimer, cookieManager, themeManager, classesManager, analyticsManager) {
    self = this;

    this.bellTimer = bellTimer;
    this.cookieManager = cookieManager;
    this.themeManager = themeManager;
    this.classesManager = classesManager;
    this.analyticsManager = analyticsManager;
  };
  UIManager.prototype.initialize = function() {
    // themes
    var loadThemes = function() {
      var refreshTheme = function() {
        var theme = self.themeManager.getCurrentThemeName();
        currentTheme = theme;
        $('#themeSelect').val(theme);
      };
      $('#themeSelect').empty();
      for (var i in self.themeManager.getAvailableThemes()) {
        $('#themeSelect').append($('<option></option>').text(i));
      }
      $('#themeSelect').on('change', function(e) {
        var theme = this.value;
        self.themeManager.setCurrentTheme(theme);
        self.analyticsManager.reportAnalytics();
        refreshTheme();
      });
      refreshTheme();
    };
    // show scroll indicator if they've never scrolled down before
    var showScrollIndicator = function() {
      if (!self.cookieManager.getJSON('has scrolled')) {
        $('.downArrow').show();
        $('#downIcon').click(function(e) {
          $('body, html').animate({
            scrollTop: $('#page2').offset().top
          }, 1500);
        });
        $(window).on('scroll', function(e) {
          if ($(window).scrollTop() > 250) {
            $(window).off('scroll');
            $('.downArrow').css('opacity', 0);
            self.cookieManager.set('has scrolled', true);
            setTimeout(function() {
              $('.downArrow').hide();
            }, 1000);
            setTimeout(function() {
              $('#downIcon').hide();
            }, 1000);
          }
        });
      }
    };
    // set state of icons/settings panel
    var setSettingsState = function() {
      $('#icons').hide();
      $('#doneIcon').hide();
      $('#scheduleEntry').hide();
      $('#icons').show();
      $('#icons').css('visibility', 'visible');

      var classes = self.classesManager.getClasses();

      var settingsMode = false;
      var enterSettingsMode = function() {
        $('#settingsIcon').hide();
        $('#scheduleDisplay').hide();
        $('#doneIcon').css('opacity', 0);
        $('#doneIcon').show();
        $('#doneIcon').css('opacity', 1);
        $('#scheduleEntry').css('opacity', 0);
        $('#scheduleEntry').show();
        $('#scheduleEntry').css('opacity', 1);
        $('#period0').select();
        settingsMode = true;
      };
      var exitSettingsMode = function() {
        $('#doneIcon').hide();
        $('#scheduleEntry').hide();
        $('#settingsIcon').css('opacity', 0);
        $('#settingsIcon').show();
        $('#settingsIcon').css('opacity', 1);
        $('#scheduleDisplay').css('opacity', 0);
        $('#scheduleDisplay').show();
        $('#scheduleDisplay').css('opacity', 1);
        settingsMode = false;
      };

      var classesTexts = [];
      var checkboxes = [];
      $('#scheduleEntryTable').empty();
      for (var i = 0; i < classes.length; i++) {
        var input = $('<input type="text" class="inputBox" name="period' +
          i + '" id="period' +
          i + '" maxlength="20" placeholder="Period ' +
          i + '" value="' + classes[i] + '">');
        var checkbox = $('<input type="checkbox" name="checkbox' + i + '" id="checkbox' + i + '" class="checkbox" checked>');
        var checkboxLabel = $('<label class="control control--checkbox"></label>').append(checkbox).append($('<div class="control__indicator"></div>'));
        var checkboxColumn = $('<td class="tableCheckbox"></td>').append(checkboxLabel);
        var row = $('<tr></tr>').append($('<td class="tableLabel"></td>').text('Period ' + i)).append($('<td class="tableInput"></td>').append(input)).append(checkboxColumn);
        $('#scheduleEntryTable').append(row);
        classesTexts.push(input);
        checkboxes.push(checkbox);
        var setToFree = function(index) {
          checkboxes[index].prop('checked', false);
          classesTexts[index].prop('disabled', true);
          classesTexts[index].val('Free');

          if (index == 7)
            $('#period0').select();
          else
            $('#period' + (index + 1)).select();
        };
        if (classes[i].toLowerCase() == 'free') {
          setToFree(i);
        }
        checkbox.change(function(e) {
          var index = parseInt(this.name.substring(8));
          if (this.checked) {
            classesTexts[index].val('Period ' + index);
            classesTexts[index].prop('disabled', false);
            $('#period' + (index)).select();
          } else {
            setToFree(index);
          }
        });
        input.on('keydown', function(e) {
          var currentPeriod = parseInt(this.id.substring(6));
          if (e.keyCode == 13) {
            if (currentPeriod == 7)
              $('#period0').select();
            else
              $('#period' + (currentPeriod + 1)).select();
          }
        });
        input.on('keyup', function(e) {
          var currentPeriod = parseInt(this.id.substring(6));
          if (this.value.toLowerCase() == 'free') {
            setToFree(currentPeriod);
          }
        });
      }
      var readClasses = function() {
        var out = [];
        for (var i in classesTexts) {
          out.push(classesTexts[i].val().trim());
        }
        return out;
      };

      $('#settingsIcon').click(function() {
        enterSettingsMode();
      });
      $('#doneIcon').click(function() {
        exitSettingsMode();
        self.classesManager.setClasses(readClasses());
        self.bellTimer.reloadData();
      });
    };
    // set font size on load and resize
    var dynamicallySetFontSize = function() {
      $('#time').css('font-size', (Math.min($(window).innerHeight() * 0.3, $(window).innerWidth() * 0.2)) + 'px');
      $('.subtitle').css('font-size', (Math.min($(window).innerHeight() * 0.07, $(window).innerWidth() * 0.07)) + 'px');

      $('.period').css('font-size', (Math.min($(window).innerHeight() * 0.03)) + 'px');
      $('.current').css('font-size', (Math.min($(window).innerHeight() * 0.05)) + 'px');

      // entry table size
      var padding = ((Math.min($(window).innerHeight() * 0.015))) + 'px';
      $('.tableLabel').css('font-size', ((Math.min($(window).innerHeight() * 0.025))) + 'px');
      $('.tableLabel').css('padding', padding);
      $('.tableCheckbox').css('padding', padding);
      $('.tableInput').css('padding', padding);
      $('#themeSelectColumn').css('padding', padding);
      $('.inputBox').css('font-size', ((Math.min($(window).innerHeight() * 0.03))) + 'px');
      $('.inputBox').css('padding', padding);
      $('#themeSelect').css('font-size', ((Math.min($(window).innerHeight() * 0.03))) + 'px');
      $('#themeSelect').css('padding', padding);

    };

    $(window).on('load resize', dynamicallySetFontSize);

    loadThemes();
    showScrollIndicator();
    setSettingsState();
    dynamicallySetFontSize();
  };
  UIManager.prototype.update = function() {
    var time = self.bellTimer.getTimeRemainingString();
    var name = self.bellTimer.getCurrentPeriod().name;
    var schedule = self.bellTimer.getCurrentSchedule();
    var color = schedule.color;

    var completed = self.bellTimer.getCompletedPeriods();
    var current = self.bellTimer.getCurrentPeriod();
    var future = self.bellTimer.getFuturePeriods();

    var proportionElapsed = self.bellTimer.getProportionElapsed();

    $('#time').text(time);
    helpers.updateTitle(time);
    $('#subtitle').text(name);
    $('#scheduleName').text(schedule.displayName);
    var min = parseInt(time.split(':')[time.split(':').length - 2]) + (parseInt(time.split(':')[time.split(':').length - 1]) / 60);
    if (time.split(':').length > 2)
      min = 60;
    if (min < 2) {
      $('#favicon').attr('href', 'favicons/red.png?v=1');
    } else if (min < 5) {
      $('#favicon').attr('href', 'favicons/orange.png?v=1');
    } else if (min < 15) {
      $('#favicon').attr('href', 'favicons/yellow.png?v=1');
    } else {
      $('#favicon').attr('href', 'favicons/lime.png?v=1');
    }

    var theme = self.themeManager.getCurrentTheme();

    $('#time').css('color', theme(time)[0]);
    $('.subtitle').css('color', theme(time)[1]);
    $('#page1').css('background-color', theme(time)[2]);

    if (color) {
      if (currentTheme == 'Default - Dark')
        $('#time').css('color', color);
      if (currentTheme == 'Default - Light')
        $('#page1').css('background-color', color);
    }


    var displayTimeArray = function(timeArray) {
      var hours = ((timeArray[0] == 0) ? 12 : (timeArray[0] > 12) ? timeArray[0] % 12 : timeArray[0]).toString();
      var minutes = timeArray[1].toString();
      if (minutes.length < 2)
        minutes = '0' + minutes;
      return hours + ':' + minutes;
    };

    var numberOfCompletedPeriods = 2;
    var numberOfFuturePeriods = 5;
    var totalPeriods = numberOfCompletedPeriods + numberOfFuturePeriods;

    if (future.length < numberOfFuturePeriods) {
      numberOfFuturePeriods = future.length;
      numberOfCompletedPeriods = totalPeriods - numberOfFuturePeriods;
    }
    if (completed.length < numberOfCompletedPeriods) {
      numberOfCompletedPeriods = completed.length;
      numberOfFuturePeriods = totalPeriods - numberOfCompletedPeriods;
    }

    completed = _.takeRight(completed, numberOfCompletedPeriods);
    future = _.take(future, numberOfFuturePeriods);

    $('#scheduleTable').empty();
    for (var i in completed) {
      if (completed[i].name != 'None')
        $('#scheduleTable').append($('<tr class="period completed"></tr>').append($('<td class="time"></td>').text(displayTimeArray(completed[i].time))).append($('<td></td>').text(completed[i].name)));
    }
    if (current && current.name != 'None')
      $('#scheduleTable').append($('<tr class="period current"></tr>').append($('<td class="time"></td>').text(displayTimeArray([self.bellTimer.getDate().getHours(), self.bellTimer.getDate().getMinutes()]))).append($('<td></td>').text(current.name)));
    for (var i in future) {
      $('#scheduleTable').append($('<tr class="period"></tr>').append($('<td class="time"></td>').text(displayTimeArray(future[i].time))).append($('<td></td>').text(future[i].name)));
    }
    if ($('#scheduleTable').children().length == 0)
      $('#noClasses').text('No classes today');
    else
      $('#noClasses').text('');

    $('.period').css('font-size', (Math.min($(window).innerHeight() * 0.03)) + 'px');
    $('.current').css('font-size', (Math.min($(window).innerHeight() * 0.05)) + 'px');

    $('#countdown').css('opacity', 1);
  };
  UIManager.prototype.updateGraphics = function() {
    var c = $('#circle')[0];
    var ctx = c.getContext('2d');

    var side = Math.floor(Math.min($(window).height(), $(window).width()));
    var width = side;
    var height = side;

    c.width = width;
    c.height = height;

    var time = self.bellTimer.getTimeRemainingString();
    var color = self.themeManager.getCurrentTheme()(time)[1];
    var proportion = self.bellTimer.getProportionElapsed();

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = side / 15;

    var radius = (Math.min(width, height) / 2) * 0.95;
    var posX = width / 2;
    var posY = height / 2;

    ctx.beginPath();
    ctx.arc(posX, posY, radius, (Math.PI / -2), (Math.PI / -2) + (-2 * Math.PI) * (1 - proportion), true);
    ctx.lineTo(posX, posY);
    ctx.closePath();
    ctx.fill();
  };
  UIManager.prototype.setLoadingMessage = function(message) {
    $('.loading').show();
    $('#loadingMessage').text(message);
  };
  UIManager.prototype.hideLoading = function() {
    $('.loading').hide();
  };
  UIManager.prototype.showAlert = function(message, time) {
    time = (time) ? time : 3000;

    $('#alert-container').css('opacity', 0);
    $('#alert').text(message);
    $('#alert-container').css('opacity', 0.4);

    setTimeout(function() {
      $('#alert-container').css('opacity', 0);
    }, time);
  };

  module.exports = UIManager;
  //window.UIManager = UIManager;
})();
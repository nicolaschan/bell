const _ = require('lodash');
const $ = require('jquery');

(function() {
    var helpers = {
        updateTitle: _.throttle(function(text) {
            $('#title').text(text);
        }, 500, {
            leading: true
        })
    };

    var self;

    var UIManager = function(bellTimer, cookieManager, themeManager, analyticsManager, requestManager) {
        self = this;

        this.bellTimer = bellTimer;
        this.cookieManager = cookieManager;
        this.themeManager = themeManager;
        this.analyticsManager = analyticsManager;
        this.requestManager = requestManager;
    };
    UIManager.prototype.initialize = function() {
        var manageSecrets = () => {
            // from https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
            var getParameterByName = function(name, url) {
                if (!url) url = window.location.href;
                name = name.replace(/[\[\]]/g, "\\$&");
                var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                    results = regex.exec(url);
                if (!results) return null;
                if (!results[2]) return '';
                return decodeURIComponent(results[2].replace(/\+/g, " "));
            };
            // end stackoverflow

            var secretParameter = getParameterByName('secret');
            var enabledSecrets = this.cookieManager.get('secrets', []);
            if (secretParameter && enabledSecrets.indexOf(secretParameter) < 0)
                enabledSecrets.push(secretParameter);

            var removeSecretParameter = getParameterByName('rmsecret');
            if (removeSecretParameter && enabledSecrets.indexOf(removeSecretParameter) > -1)
                enabledSecrets.splice(enabledSecrets.indexOf(removeSecretParameter), 1);
            this.cookieManager.set('secrets', enabledSecrets);

            var source = getParameterByName('source');
            if (source)
                this.cookieManager.set('source', source);

            if (secretParameter || removeSecretParameter || source)
                window.location = '/';
        };

        // themes
        var loadThemes = () => {
            var refreshTheme = () => {
                var theme = this.themeManager.getCurrentThemeName();
                $('#themeSelect').val(theme);
            };
            $('#themeSelect').empty();
            for (var i in this.themeManager.getAvailableThemes()) {
                if (i.toLowerCase().indexOf('secret') == 0) {
                    var enabledSecrets = this.cookieManager.get('secrets');
                    var themeName = i.toLowerCase().substring(i.toLowerCase().indexOf(': ') + 2);
                    if (!enabledSecrets || enabledSecrets.indexOf(themeName) < 0) {
                        if (this.themeManager.getCurrentThemeName() == i)
                            this.themeManager.setCurrentTheme(this.themeManager.getDefaultThemeName());
                        continue;
                    }
                }
                $('#themeSelect').append($('<option></option>').text(i));
            }
            $('#themeSelect').on('change', e => {
                var theme = this.value;
                this.themeManager.setCurrentTheme(theme);
                if (theme.toLowerCase().indexOf('secret') != 0)
                    this.analyticsManager.reportAnalytics();
                refreshTheme();
            });
            refreshTheme();
        };
        // show scroll indicator if they've never scrolled down before
        var showScrollIndicator = () => {
            if (!self.cookieManager.get('has_scrolled')) {
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
                        self.cookieManager.set('has_scrolled', true);
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
        var setSettingsState = () => {
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
                window.location.href = '/settings'
                    // enterSettingsMode();
            });
            $('#doneIcon').click(function() {
                exitSettingsMode();
                self.classesManager.setClasses(readClasses());
                self.bellTimer.reloadData();
            });
        };
        var showSettingsIcon = () => {
            $('#icons').hide();
            $('#doneIcon').hide();
            $('#scheduleEntry').hide();
            $('#icons').show();
            $('#icons').css('visibility', 'visible');

            $('#settingsIcon').css('opacity', 0);
            $('#settingsIcon').show();
            $('#settingsIcon').css('opacity', 1);

            $('#settingsIcon').click(() => window.location = '/settings');
        };

        // set font size on load and resize
        var dynamicallySetFontSize = () => {
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
        // slide in extension ad
        var slideExtension = () => {
            if (self.cookieManager.get('popup') == $('#extension-text').text())
                return $('.extension').hide();

            // $('#extension').css('transition', 'transform 2s ease-out,  background-color 1s ease');
            // $('#extension').css('transform', 'translateX(0)');
            $('.extension').css('visibility', 'visible');
            $('.extension').css('opacity', '1');
            $('#dismiss').click(function(e) {
                self.cookieManager.set('popup', $('#extension-text').text());
                $('.extension').css('opacity', '0');
                setTimeout(function() {
                    $('.extension').hide();
                }, 1050);
                // $('#extension').css('transition', 'transform 0.7s ease-in,  background-color 1s ease');
                // $('#extension').css('transform', 'translateX(120%)');
            });
        };

        $(window).on('load resize', dynamicallySetFontSize);

        manageSecrets();
        loadThemes();
        showScrollIndicator();
        // setSettingsState();
        showSettingsIcon();
        dynamicallySetFontSize();
        return self.loadPopup();
        // slideExtension();
    };
    UIManager.prototype.loadPopup = async function() {
        var message = await this.requestManager.get('/api/message');
        message.text = message.text.trim();

        if (!message.enabled || !message.text)
            return $('.extension').hide();
        if (self.cookieManager.get('popup') == message.text)
            return $('.extension').hide();
        if ($('#extension-text').text() == message.text)
            return;

        $('#popup').empty();
        if (message.href)
            $('#popup').append(
                $(`<a class="link center-vertical" href=${message.href} target="_blank"></a>`)
                .append($(`<span id="extension-text"></span>`).text(message.text))
            );
        else
            $('#popup').append($(`<span id="extension-text"></span>`).text(message.text));


        $('.extension').css('visibility', 'visible');
        $('.extension').css('opacity', 1);
        $('.extension').show();
        $('#dismiss').click(function(e) {
            self.cookieManager.set('popup', message.text);
            $('.extension').css('opacity', '0');
            setTimeout(function() {
                $('.extension').hide();
            }, 1050);
        });
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

        var faviconColors = {
            lime: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJ2SURBVHhe7ZrPT8IwFMcLooFkYsCDxosn/w+46MXwLwlXjfq/EC960X+FizclDkIIQuZ7a5eYSOzrj20t6yfZ2i7Z9t53fV23PhYIBAKBQKCy1ERZDMODc9gP2M3BNZRYP8PDwDtsEzZaPUE5ZsPVJD26EyTNW5ZEid4G53rJsH4CDsR/HdLe4vSaOWA3BHqNPfba/IRamx+wTsz6yy57W29E25i6KM1JWg/g/BpqeTmPtNN74L0sYacHJBE+9Q5vFMaU1eZdUdfGXACM0TKpzY18MBOgbOczDETQF8AV5zM0RdAbBHnMu4WmTeoCJK172Bc94FHoCNuUUOs2vUYDXkPfouUm/eU+zBPwdUxCTYAk+oJ9nu95G8QwHhyJuhR6CPCpqOvOI22VaTO9B+B8nLFD3nCeGfQC0sNSGQR9cR4h20oTwMfPUqLNtBBwbdJDhTA50psI7RByAfhvLD8h2E7pAQNR+ojUdvkYkETPsL/kDe94gXHgStS3QukB/oYAwXaKANmvax+R2h7eAqL8D1y08BWp7RQBfF6lkdouF4AvV/kJwXZKDxiL0kektodvAVFWFqIA6ztR8QiazbQQQHwLA+I6gUoIzETpA2Rb6QKMFhei5j4KttJDAKn0b3EEkxNcR9FGNQHSzIyNteQE+4BtitkjaiGQUU5ChAythAk9AZAdWR7XFwBxRQRN5xEzAZCyRTBwHlEbBLfBDZjyRqFgzBs/QHMBkHTw2TyKVgHAvSxkiCHmIfAbnkDxAbW8JkuYKHmskgAhw04PyEDDcBY2WpxCy+a3wyy9Jl7bovPF4HiytN0QkFHJdPlAIBAIBAJuwtgP7E4JhsQhusQAAAAASUVORK5CYII=',
            red: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALISURBVHhe7ZoxaxVBEMfnjgg2vvC0MMbCgPgZtEyVNPI+QFIKlqZR/AySoGgpWOoHCGlilVI/gwimSIJFIr7XCMqd88/NgTyiO7u3d7fr7Q8eM3OQ3OzczO7e7VAikUgkEonBkonshEcZ3WIx2croPkvoy7jOHPPv8GVJeyx3X5V0eH61A1oPwFFO2z+IHotpxWWinZsFPRGzFVoJwNOMrj/M6BOrV6orjZm9LunOs5K+iu0NrwG4S7TwLqdTVkfVFe9MNwq69pHol9iNyUU2hlP9OQ/+J6ttDR6McA/cS+zGeMmAzzmdsRhXVmd8u13QVdGdaZQBqxxAHnzJateDB2PcGz6I7YTzH+PGb3IqxOyVBwXlB3T+IKxxDoA8+WDgcnAai1MJSM0HhatP1gGQGbiPmjcxdlkdrNLmHq/zb6ulLlg2C7r0wWKfYBUATrPvLNpc530w5flgUXQj6hLA9pZF6IMHI/FVhToD+OlPWfja27fNjLNA9bBsJsFYBg/UvqoCgFdaUaNB67OqBELb9GjRbI6cNkL/E8YAyGesKNH4rsmAicgYMfpurBGu/30Wa5UVHe95HlgX/UI0GbAiMkaMvmsCcENkjBh9T6uAyH+BQ4tYMfquCUBnpzQtYPTdGAA5rooSje+aDNgVGSNG39O7gMjBogoATmlFjQatz6oSALGVgSb9gU0JzETGgNpXdQBwPi9q8Nj4qi4BwGUw3M/iAM0JogaLrY9WAUBnBs+uL8QMDvhm2z1iVQI1XAp9NESYcGqYcAoACG1Z1C5781iVwJ+gKUHU3mnii3MGgBC6RJp0h4BGAajpaU7ov0mqBo50uTrgXj4GD7xkQI00ULTaKLnJ67xNA4QJrxMZHOMns8hb0SU2fb47oFV2Cf/b5+CB1wy4CJzSDq5Z+m/Mtcvj0KL+bn/Cvy99tMsnEolEIpEYKkS/AVZgqhtm395wAAAAAElFTkSuQmCC',
            yellow: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKmSURBVHhe7ZrNbtNAEMfXDkb00KDAAdFLufQ9wgU4oLwLXKkgkdpeWtF3iXpouZBHIZdwAoR7AJGPZSaeXNKoO7te2zvJ/iRrZ9PG/u94Zr3xjopEIpFIJLKzJNTWQv+4daiU7n360HoLVwZbHRR/UROl1XhwOr8CScP+yXxMn8tH/2ud67+Zdjrgu3QaWfQ/Js9gAPmdAbkfOZ6TTu8VrynQ7aoHX6+zH2C2i0+8k798M306GqkZ9UvjzQEQrp/VIn1H3WpJF5fJw/l76pXCiwMgRH9C0yl6tfEreTR9QrYzKbVOQMgnmKNg1j14pIPXRg3Ud8L5y3hhyPcFdRsF5oUU5gW8EdY4O4DufDBAOjiNxSkFKOeDwlWTtQOWs30zOW+iQ9qssHIAPudre9S5ANqWGi2wyhsIs9/QVLXI8UUO88Fjso2wI4CWoqEPHmnbLJvZEQB3P4dmv+gFzy1EAetm2cwBUgaPsLWyHCDxZylXMysFQlv0cOEsjqzXAduG0QHFayyZcLQzIkD3yBCIWbsxR/Sf7Ab+6xV1ZaHVl2Rv+pp6GzFHQKJekCUPhnbOJPicWokYtcenALX3MaFWIkbtZgdoJXeXhqHd6IBiu0omHO2MFEiGZAjErD3+FqB2Z+E5IF1ckCUHpmZWCiDS0oC7T2CTArfUSoCtle2AwdnsiMzgsdHKTgFkp1+LI1icQGaw2Gq0igCk1kIIWxwKJ6wdgEAqNFEQYcKpYMLJAUhoj0XuY28d55UgFiWQ2ThltDhHABJClUiZ6hCklANWNDQnNF8ktWIpBGZg6lYPzvYeBo94y2N8/EA4ZmDiLnJVYKFk5qtGsDIklcpWDu7SbhgQ76hhV9rLJMhlrVweNy1W7+2/wzz+bSvL5SORSCQSiQSKUv8BpFWbHfFIhJAAAAAASUVORK5CYII=',
            orange: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALcSURBVHhe7ZqxThtBEIbPYFlBIjgOBSQNadKkSR7BbkKDLHoaGhoaSBRqTB0UJ02aNG7SR1YaaOxHIE0aGmhAFICxLdmyuDgz5zkpQiQ7u7d3t5vbT7Jm5yTwv3Mze3ve8RwOh8PhcGSWHNlEqK0XlsBUd9cLK2Bx/BSvA2fwOd1rjL6DbdYao9PgagLEHoDxt5n33qPpd+TK0fH3c6uDHfJiIZYA1NamF3Y3Zo5h+HByJTK9vS+D57Wv/gX52tAagPLLfL716cElDOcmV7TTrWwN59s/bm/Jj4y2AECqf4BUf0NuvHT8OpTGW/IioSUA4/bsFZjSxEuM61y5/5jGykyRVaL8wsvB5McwTHrySAm/GzWQr4TyH+MXtz7P/iI3VSqb/an2Tw9vhDTKAaA7bwxQDkpzUSoBqnmjUNUkHYBgtU+n5kWUSJsUUgEov8rnE3vUqQDaAo0SSNUNpNkNmLg2ObrownpQpLEQdgbg9haM6ZNH5kgrC3YGwN3vgtG1t4+bHmQB62bJrAG2TB5ha2UFIHiltQyuZlYJmLbp4cLZHEnvA/43hAGgn7GshKOdkwFVsjYi1C6sEaj/AzCvJ551HMI6sEzje+FkwDOyNiLUzgnAE7I2ItTungJk/wUeWtiKUDsnAImd0sSAULswAHRcZSUc7ZwMaJK1EaF29y5ANrPwAtDx92lkD0zNrBJAbCsDTvojMiXQI2sDbK3sAOD5PA2NR0YruwQQKIPs/iyOYHMCDY1FVqNUAILOjI5fJ9c8QJts94hUCYRAKaTRECFCqWFCKQCIaY9F7mPvLlIl8CfYlEDD1ImiRTkDEBO6RKJ0hyCRAhCS0pqQfpNUSCAkyacDtslpmDyiJQNCsDmh9THmRsnt4Xz7SF+jpNaFDIXBnSnCVnQRXJ3vDtgqu4j/W+fkEa0ZcB/BKW3WmqX/xp12eTy0CH+3P4fPSRrt8g6Hw+FwOLKK5/0GBprnoamgn5kAAAAASUVORK5CYII='
        };

        if (min < 2) {
            favicon.href = faviconColors.red;
        } else if (min < 5) {
            favicon.href = faviconColors.orange;
        } else if (min < 15) {
            favicon.href = faviconColors.yellow;
        } else {
            favicon.href = faviconColors.lime;
        }

        var theme = self.themeManager.getCurrentTheme();

        $('.time').css('color', theme(time)[0]);
        $('.subtitle').css('color', theme(time)[1]);
        if (typeof theme(time)[2] == 'string') {
            $('#page1').css('background-color', theme(time)[2]);
            $('#page1').css('background-image', '');
            $('#page1').css('background-size', '');
        } else {
            for (var prop in theme(time)[2])
                $('#page1').css(prop, theme(time)[2][prop]);
        }

        // popup stuff
        $('.extension').css('background-color', theme(time)[3]);
        $('.link').css('color', theme(time)[1]);

        if (color) {
            if (theme == 'Default - Dark')
                $('.time').css('color', color);
            if (theme == 'Default - Light')
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
        $('.loading').css('opacity', 0);
        setTimeout(() => {
            $('.loading').hide();
            $('.loading').css('opacity', 0.3);
        }, 350);
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
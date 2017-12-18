const m = require('mithril');
const root = document.body;
const $ = require('jquery');

var getIconImage = function(min) {
    var faviconColors = {
        lime: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAJ2SURBVHhe7ZrPT8IwFMcLooFkYsCDxosn/w+46MXwLwlXjfq/EC960X+FizclDkIIQuZ7a5eYSOzrj20t6yfZ2i7Z9t53fV23PhYIBAKBQKCy1ERZDMODc9gP2M3BNZRYP8PDwDtsEzZaPUE5ZsPVJD26EyTNW5ZEid4G53rJsH4CDsR/HdLe4vSaOWA3BHqNPfba/IRamx+wTsz6yy57W29E25i6KM1JWg/g/BpqeTmPtNN74L0sYacHJBE+9Q5vFMaU1eZdUdfGXACM0TKpzY18MBOgbOczDETQF8AV5zM0RdAbBHnMu4WmTeoCJK172Bc94FHoCNuUUOs2vUYDXkPfouUm/eU+zBPwdUxCTYAk+oJ9nu95G8QwHhyJuhR6CPCpqOvOI22VaTO9B+B8nLFD3nCeGfQC0sNSGQR9cR4h20oTwMfPUqLNtBBwbdJDhTA50psI7RByAfhvLD8h2E7pAQNR+ojUdvkYkETPsL/kDe94gXHgStS3QukB/oYAwXaKANmvax+R2h7eAqL8D1y08BWp7RQBfF6lkdouF4AvV/kJwXZKDxiL0kektodvAVFWFqIA6ztR8QiazbQQQHwLA+I6gUoIzETpA2Rb6QKMFhei5j4KttJDAKn0b3EEkxNcR9FGNQHSzIyNteQE+4BtitkjaiGQUU5ChAythAk9AZAdWR7XFwBxRQRN5xEzAZCyRTBwHlEbBLfBDZjyRqFgzBs/QHMBkHTw2TyKVgHAvSxkiCHmIfAbnkDxAbW8JkuYKHmskgAhw04PyEDDcBY2WpxCy+a3wyy9Jl7bovPF4HiytN0QkFHJdPlAIBAIBAJuwtgP7E4JhsQhusQAAAAASUVORK5CYII=',
        red: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALISURBVHhe7ZoxaxVBEMfnjgg2vvC0MMbCgPgZtEyVNPI+QFIKlqZR/AySoGgpWOoHCGlilVI/gwimSIJFIr7XCMqd88/NgTyiO7u3d7fr7Q8eM3OQ3OzczO7e7VAikUgkEonBkonshEcZ3WIx2croPkvoy7jOHPPv8GVJeyx3X5V0eH61A1oPwFFO2z+IHotpxWWinZsFPRGzFVoJwNOMrj/M6BOrV6orjZm9LunOs5K+iu0NrwG4S7TwLqdTVkfVFe9MNwq69pHol9iNyUU2hlP9OQ/+J6ttDR6McA/cS+zGeMmAzzmdsRhXVmd8u13QVdGdaZQBqxxAHnzJateDB2PcGz6I7YTzH+PGb3IqxOyVBwXlB3T+IKxxDoA8+WDgcnAai1MJSM0HhatP1gGQGbiPmjcxdlkdrNLmHq/zb6ulLlg2C7r0wWKfYBUATrPvLNpc530w5flgUXQj6hLA9pZF6IMHI/FVhToD+OlPWfja27fNjLNA9bBsJsFYBg/UvqoCgFdaUaNB67OqBELb9GjRbI6cNkL/E8YAyGesKNH4rsmAicgYMfpurBGu/30Wa5UVHe95HlgX/UI0GbAiMkaMvmsCcENkjBh9T6uAyH+BQ4tYMfquCUBnpzQtYPTdGAA5rooSje+aDNgVGSNG39O7gMjBogoATmlFjQatz6oSALGVgSb9gU0JzETGgNpXdQBwPi9q8Nj4qi4BwGUw3M/iAM0JogaLrY9WAUBnBs+uL8QMDvhm2z1iVQI1XAp9NESYcGqYcAoACG1Z1C5781iVwJ+gKUHU3mnii3MGgBC6RJp0h4BGAajpaU7ov0mqBo50uTrgXj4GD7xkQI00ULTaKLnJ67xNA4QJrxMZHOMns8hb0SU2fb47oFV2Cf/b5+CB1wy4CJzSDq5Z+m/Mtcvj0KL+bn/Cvy99tMsnEolEIpEYKkS/AVZgqhtm395wAAAAAElFTkSuQmCC',
        yellow: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAKmSURBVHhe7ZrNbtNAEMfXDkb00KDAAdFLufQ9wgU4oLwLXKkgkdpeWtF3iXpouZBHIZdwAoR7AJGPZSaeXNKoO7te2zvJ/iRrZ9PG/u94Zr3xjopEIpFIJLKzJNTWQv+4daiU7n360HoLVwZbHRR/UROl1XhwOr8CScP+yXxMn8tH/2ud67+Zdjrgu3QaWfQ/Js9gAPmdAbkfOZ6TTu8VrynQ7aoHX6+zH2C2i0+8k798M306GqkZ9UvjzQEQrp/VIn1H3WpJF5fJw/l76pXCiwMgRH9C0yl6tfEreTR9QrYzKbVOQMgnmKNg1j14pIPXRg3Ud8L5y3hhyPcFdRsF5oUU5gW8EdY4O4DufDBAOjiNxSkFKOeDwlWTtQOWs30zOW+iQ9qssHIAPudre9S5ANqWGi2wyhsIs9/QVLXI8UUO88Fjso2wI4CWoqEPHmnbLJvZEQB3P4dmv+gFzy1EAetm2cwBUgaPsLWyHCDxZylXMysFQlv0cOEsjqzXAduG0QHFayyZcLQzIkD3yBCIWbsxR/Sf7Ab+6xV1ZaHVl2Rv+pp6GzFHQKJekCUPhnbOJPicWokYtcenALX3MaFWIkbtZgdoJXeXhqHd6IBiu0omHO2MFEiGZAjErD3+FqB2Z+E5IF1ckCUHpmZWCiDS0oC7T2CTArfUSoCtle2AwdnsiMzgsdHKTgFkp1+LI1icQGaw2Gq0igCk1kIIWxwKJ6wdgEAqNFEQYcKpYMLJAUhoj0XuY28d55UgFiWQ2ThltDhHABJClUiZ6hCklANWNDQnNF8ktWIpBGZg6lYPzvYeBo94y2N8/EA4ZmDiLnJVYKFk5qtGsDIklcpWDu7SbhgQ76hhV9rLJMhlrVweNy1W7+2/wzz+bSvL5SORSCQSiQSKUv8BpFWbHfFIhJAAAAAASUVORK5CYII=',
        orange: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAALcSURBVHhe7ZqxThtBEIbPYFlBIjgOBSQNadKkSR7BbkKDLHoaGhoaSBRqTB0UJ02aNG7SR1YaaOxHIE0aGmhAFICxLdmyuDgz5zkpQiQ7u7d3t5vbT7Jm5yTwv3Mze3ve8RwOh8PhcGSWHNlEqK0XlsBUd9cLK2Bx/BSvA2fwOd1rjL6DbdYao9PgagLEHoDxt5n33qPpd+TK0fH3c6uDHfJiIZYA1NamF3Y3Zo5h+HByJTK9vS+D57Wv/gX52tAagPLLfL716cElDOcmV7TTrWwN59s/bm/Jj4y2AECqf4BUf0NuvHT8OpTGW/IioSUA4/bsFZjSxEuM61y5/5jGykyRVaL8wsvB5McwTHrySAm/GzWQr4TyH+MXtz7P/iI3VSqb/an2Tw9vhDTKAaA7bwxQDkpzUSoBqnmjUNUkHYBgtU+n5kWUSJsUUgEov8rnE3vUqQDaAo0SSNUNpNkNmLg2ObrownpQpLEQdgbg9haM6ZNH5kgrC3YGwN3vgtG1t4+bHmQB62bJrAG2TB5ha2UFIHiltQyuZlYJmLbp4cLZHEnvA/43hAGgn7GshKOdkwFVsjYi1C6sEaj/AzCvJ551HMI6sEzje+FkwDOyNiLUzgnAE7I2ItTungJk/wUeWtiKUDsnAImd0sSAULswAHRcZSUc7ZwMaJK1EaF29y5ANrPwAtDx92lkD0zNrBJAbCsDTvojMiXQI2sDbK3sAOD5PA2NR0YruwQQKIPs/iyOYHMCDY1FVqNUAILOjI5fJ9c8QJts94hUCYRAKaTRECFCqWFCKQCIaY9F7mPvLlIl8CfYlEDD1ImiRTkDEBO6RKJ0hyCRAhCS0pqQfpNUSCAkyacDtslpmDyiJQNCsDmh9THmRsnt4Xz7SF+jpNaFDIXBnSnCVnQRXJ3vDtgqu4j/W+fkEa0ZcB/BKW3WmqX/xp12eTy0CH+3P4fPSRrt8g6Hw+FwOLKK5/0GBprnoamgn5kAAAAASUVORK5CYII='
    };
    if (min < 2)
        return faviconColors.red;
    else if (min < 5)
        return faviconColors.orange;
    else if (min < 15)
        return faviconColors.yellow;
    else
        return faviconColors.lime;
}

var Timer = {
    view: function(vnode) {
        var time = vnode.attrs.model.bellTimer.getTimeRemainingString();

        // This should be moved out to somewhere that makes sense
        document.title = time;
        
        var min = parseInt(time.split(':')[time.split(':').length - 2]) + (parseInt(time.split(':')[time.split(':').length - 1]) / 60);
        if (time.split(':').length > 2)
            min = 60;
        favicon.href = getIconImage(min)

        var theme = vnode.attrs.model.themeManager.getCurrentTheme()(time);
        return m('.time', {
            style: {
                color: theme[0]
            }
        }, time);
    }
};
var Period = {
    view: function(vnode) {
        var time = vnode.attrs.model.bellTimer.getTimeRemainingString();
        var theme = vnode.attrs.model.themeManager.getCurrentTheme()(time);
        return m('.period', {
            style: {
                color: theme[1]
            }
        }, vnode.attrs.model.bellTimer.getCurrentPeriod().name);
    }
};
var ScheduleName = {
    view: function(vnode) {
        var time = vnode.attrs.model.bellTimer.getTimeRemainingString();
        var theme = vnode.attrs.model.themeManager.getCurrentTheme()(time);
        return m('.schedule', {
            style: {
                color: theme[1]
            }
        }, vnode.attrs.model.bellTimer.getCurrentSchedule().display);
    }
};
var ScheduleDisplay = {
    view: function(vnode) {
        var bellTimer = vnode.attrs.model.bellTimer;

        var completed = bellTimer.getCompletedPeriods();
        var current = bellTimer.getCurrentPeriod();
        var future = bellTimer.getFuturePeriods();

        var displayTimeArray = function(timeArray) {
            timeArray = [timeArray.hour, timeArray.min];

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

        completed = completed.slice(completed.length - numberOfCompletedPeriods);
        future = future.slice(0, numberOfFuturePeriods);

        if (!completed.length && !future.length && current.name == 'Free')
            return m('.no-classes', 'No classes today');

        var rows = [];
        for (let period of completed)
            rows.push(m('tr.completed', [m('td.time', displayTimeArray(period.time)), m('td', period.name)]));
        if (current)
            rows.push(m('tr.current', [m('td.time', displayTimeArray({
                hour: bellTimer.getDate().getHours(),
                min: bellTimer.getDate().getMinutes()
            })), m('td', current.name)]));
        for (let period of future)
            rows.push(m('tr.future', [m('td.time', displayTimeArray(period.time)), m('td', period.name)]));

        return m('table', rows);
    }
};
var updateGraphics = function(vnode) {
    // return;
    var c = vnode.dom;
    var bellTimer = vnode.attrs.model.bellTimer;
    var themeManager = vnode.attrs.model.themeManager;

    var ctx = c.getContext('2d');

    var side = Math.floor(Math.min(window.innerHeight, window.innerWidth));
    var width = side;
    var height = side;

    c.width = width;
    c.height = height;

    var time = bellTimer.getTimeRemainingString();
    var color = themeManager.getCurrentTheme()(time)[1];
    var proportion = bellTimer.getProportionElapsed();

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
var Page1 = {
    view: function(vnode) {
        var time = vnode.attrs.model.bellTimer.getTimeRemainingString();
        var theme = vnode.attrs.model.themeManager.getCurrentTheme()(time);

        var style;
        if (typeof theme[2] == 'string') {
            style = {
                'background-color': theme[2]
            };
        } else {
            style = theme[2];
        }

        return m('.container#page1', {
            style: style
        }, [
            m('.centered.time-text', [
                m(Timer, vnode.attrs),
                m(Period, vnode.attrs),
                m(ScheduleName, vnode.attrs)
            ]),
            m('canvas.centered', {
                onupdate: updateGraphics,
                model: vnode.attrs.model
            })
        ])
    }
};
var Popup = {
    view: function(vnode) {
        var model = vnode.attrs.model;
        if (!model.popupModel.visible)
            return;
        var time = model.bellTimer.getTimeRemainingString();
        var theme = model.themeManager.getCurrentTheme()(time);

        return m('.top.right.popup.fade-in', {
            style: {
                visibility: (model.popupModel.visible) ? 'visible' : 'hidden',
                'background-color': theme[3]
            }
        }, m('table', m('tr', [
            m('td', m(`${model.popupModel.href ? 'a.link' : 'span'}.center-vertical[target=_blank]`, {
                href: model.popupModel.href,
                style: {
                    color: theme[1]
                }
            }, model.popupModel.text)),
            m('td', m('a.dismiss.center-vertical[href="#"]', {
                onclick: function() {
                    model.popupModel.visible = false;
                }
            }, m('i.dismiss-icon.material-icons', 'cancel')))
        ])));
    }
};
var SchoolIndicator = {
    view: function(vnode) {
        var model = vnode.attrs.model;
        var source = model.bellTimer.source;
        var time = model.bellTimer.getTimeRemainingString();
        var theme = model.themeManager.getCurrentTheme()(time);
        var meta = model.requestManager.getSync(`/api/data/${source}/meta`);
        if (!meta)
            return;

        return m('.top.left.popup.school-indicator', m('table', m('tr', [
            m('td', m('a.no-decoration.center-vertical', {
                href: '/settings',
                style: {
                    color: theme[1]
                }
            }, meta.name))
        ])));
    }
};

class MithrilUI {
    constructor(uiModel) {
        this.uiModel = uiModel;

        m.mount(root, {
            view: function() {
                if (!uiModel.state.ready)
                    return m('.centered.loading', [
                        m('i.material-icons.loading-icon.spin', 'sync'),
                        m('br'),
                        m('.loading-message', uiModel.state.loadingMessage.value)
                    ]);
                return [m('span', {
                    style: {
                        'font-size': (Math.min(window.innerHeight * 0.3, window.innerWidth * 0.2) * 0.1) + 'px'
                    }
                }, [m(Page1, {
                    model: uiModel
                }), m('.container#page2', [
                    m('.centered', [
                        m(ScheduleDisplay, {
                            model: uiModel
                        })
                    ]),
                    m('.footer-right', m('a[href=/settings]',
                        m('i.settings-icon.material-icons', 'settings')))
                ]), m(Popup, {
                    model: uiModel
                }), m(SchoolIndicator, {
                    model: uiModel
                }), m('i.down-arrow.pulse.material-icons', {
                    onclick: function() {
                        $('body, html').animate({
                            scrollTop: $('#page2').offset().top
                        }, 1500);
                    },
                    oninit: function() {
                        if (uiModel.cookieManager.get('has_scrolled'))
                            return;
                        $(window).on('scroll', function(e) {
                            if ($(window).scrollTop() > 250) {
                                $(window).off('scroll');
                                uiModel.cookieManager.set('has_scrolled', true);
                            }
                        });
                    },
                    style: {
                        visibility: uiModel.cookieManager.get('has_scrolled') ? 'hidden' : 'visible'
                    }
                }, 'keyboard_arrow_down')])];
            }
        });
    }

    redraw() {
        m.redraw();
    }
}

module.exports = MithrilUI;
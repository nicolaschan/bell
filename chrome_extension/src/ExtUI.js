const m = require('mithril');
const root = document.getElementById('root');

const hostname = 'https://countdown.zone';

var openSettingsTab = function() {
    chrome.tabs.create({
        url: `${hostname}/settings`
    });
};

// Below code is almost all from MithrilUI.js, with some modification
var SchoolIndicator = {
    view: function(vnode) {
        var model = vnode.attrs.model;
        var source = model.bellTimer.source;
        var time = model.bellTimer.getTimeRemainingString();
        var theme = model.themeManager.currentTheme.theme(model.bellTimer);
        var meta = model.requestManager.getSync(`/api/data/${source}/meta`);
        if (!meta)
            return;

        return m('.top.left.popup.school-indicator', m('table', m('tr', [
            m('td', m('a.no-decoration.center-vertical', {
                href: `${hostname}/settings`,
                style: theme.subtext,
                onclick: openSettingsTab
            }, meta.name))
        ])));
    }
};
var Page1 = require('../../src/ui/Page1')

class ExtUI {
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
                }), m('.centered'),
                    m('.footer-right', m(`a[href=${hostname}/settings]`,
                        m('i.settings-icon.material-icons', {
                        	onclick: openSettingsTab
                        }, 'settings')))
                ]), m(SchoolIndicator, {
                    model: uiModel
                })];
            }
        });
    }

    redraw() {
        m.redraw();
    }
}

module.exports = ExtUI;
const $ = require('jquery');
const Chart = require('chart.js');

const CookieManager = require('./CookieManager3');
const RequestManager = require('./RequestManager');

var cookieManager = new CookieManager();
var requestManager = new RequestManager(cookieManager, null, null, null, 10000);

global.requestManager = requestManager;
global.cookieManager = cookieManager;
$(window).on('load', async function() {
    await cookieManager.initialize();
    var data = await requestManager.getNoCache('/api/stats');
    console.log(data);

    var hits = data.totalHits.map(d => {
        return {
            x: d.date,
            y: d.count
        }
    });
    var devices = data.uniqueHits.map(d => {
        return {
            x: d.date,
            y: d.count
        }
    });
    hits = hits.splice(hits.length - 48 - 1);
    devices = devices.splice(devices.length - 48 - 1);
    var dailyStats = new Chart($('#dailyStats'), {
        type: 'line',
        data: {
            datasets: [{
                fill: false,
                label: 'Devices',
                data: devices,
                pointBorderColor: 'rgba(72, 198, 240, 0.4)',
                lineTension: 0.2,
                backgroundColor: "rgba(72, 198, 240, 1)",
                borderColor: "rgba(72, 198, 240, 1)",
                pointHitRadius: 10,
                borderWidth: 4
            }, {
                fill: false,
                label: 'Total Hits',
                data: hits,
                pointBorderColor: 'rgba(72, 240, 103, 0.4)',
                lineTension: 0.2,
                backgroundColor: 'rgba(72, 240, 103, 1)',
                borderColor: 'rgba(72, 240, 103, 1)',
                pointHitRadius: 10,
                borderWidth: 4
            }]
        },
        options: {
            title: {
                display: true,
                text: 'Daily stats for bell.lahs.club'
            },
            scales: {
                xAxes: [{
                    type: 'time',
                    time: {
                        unit: 'day',
                        unitStepSize: 1,
                        displayFormats: {
                            day: 'ddd MM/DD'
                        }
                    },
                    position: 'bottom'
                }],
                yAxes: [{
                    ticks: {
                        min: 0
                    }
                }]
            },
            elements: {
                point: {
                    radius: 2,
                    hoverRadius: 5
                }
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    title: function(tooltipItems, data) {
                        var date = tooltipItems[0].xLabel;
                        return date.toLocaleDateString();
                    }
                }
            }
        }
    });


    var themeColorsLabels = {
        'Default - Light': 'rgb(51, 255, 0)',
        'Rainbow - Light': 'rgb(255, 0, 0)',
        'Pastel - Dark': 'rgb(255, 153, 0)',
        'Pastel - Light': 'rgb(204, 255, 0)',
        'Default - Dark': 'rgb(0, 255, 102)',
        'Rainbow - Dark': 'rgb(255, 0, 153)',
        'Grays - Dark': 'darkgray',
        'Blues - Dark': 'rgb(51, 0, 255)',
        'Grays - Light': 'lightgray',
        'Blues - Light': 'rgb(0, 255, 255)',
        'Gradient - Light': 'rgb(204, 0, 255)'
    };
    var themesNumbers = [];
    var themesLabels = [];
    var themesColors = [];
    for (var stat of data.themeStats) {
        themesLabels.push(stat.theme);
        themesNumbers.push(stat.count);
        themesColors.push(themeColorsLabels[stat.theme]);
    }
    var themesData = {
        labels: themesLabels,
        datasets: [{
            data: themesNumbers,
            backgroundColor: themesColors,
            hoverBackgroundColor: themesColors
        }]
    };
    var themes = new Chart($('#themes'), {
        type: 'pie',
        data: themesData,
        options: {}
    });

    var osColorsLabels = {
        'Mac OS': 'rgb(72, 139, 194)',
        iOS: 'rgb(120, 28, 129)',
        Linux: 'rgb(231, 126, 39)',
        Windows: 'rgb(64, 67, 153)',
        Android: 'rgb(159, 190, 87)'
    };
    var osNumbers = [];
    var osLabels = [];
    var osColors = [];
    for (var stat of data.osStats) {
        osLabels.push(stat.os);
        osNumbers.push(stat.count);
        osColors.push(osColorsLabels[stat.os]);
    }
    var osData = {
        labels: osLabels,
        datasets: [{
            data: osNumbers,
            backgroundColor: osColors,
            hoverBackgroundColor: osColors
        }]
    };
    var os = new Chart($('#os'), {
        type: 'pie',
        data: osData,
        options: {}
    });

    var browserColorsLabels = {
        Safari: 'rgb(56, 108, 176)',
        Chrome: 'rgb(240, 2, 127)',
        Firefox: 'rgb(253, 192, 134)',
        Edge: 'rgb(190, 174, 212)',
        IE: 'rgb(127, 201, 127)',
        'Mobile Safari': 'rgb(255, 255, 153)'
    };
    var browserNumbers = [];
    var browserLabels = [];
    var browserColors = [];
    for (var stat of data.browserStats) {
        browserLabels.push(stat.browser);
        browserNumbers.push(stat.count);
        browserColors.push(browserColorsLabels[stat.browser]);
    }
    var browserData = {
        labels: browserLabels,
        datasets: [{
            data: browserNumbers,
            backgroundColor: browserColors,
            hoverBackgroundColor: browserColors
        }]
    };
    var browser = new Chart($('#browser'), {
        type: 'pie',
        data: browserData,
        options: {}
    });
});
const $ = require('jquery');
const Chart = require('chart.js');

$(function() {
  requestManager.getNoCache('/api/stats').then(function(data) {
    var hits = [];
    var devices = [];

    for (var date in data.dailyStats) {
      hits.push({
        x: new Date(date),
        y: parseInt(data.dailyStats[date].totalHits)
      });
      devices.push({
        x: new Date(date),
        y: parseInt(data.dailyStats[date].devices)
      });
    }
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
      'Default - Light': 'lime',
      'Rainbow - Light': 'red',
      'Pastel - Dark': '#79A86F',
      'Pastel - Light': '#bcffae',
      'Default - Dark': '#067500',
      'Rainbow - Dark': '#850000',
      'Grays - Dark': 'darkgray',
      'Blues - Dark': '#002db3',
      'Grays - Light': 'lightgray',
      'Blues - Light': '#ccffff'
    };
    var themesNumbers = [];
    var themesLabels = [];
    var themesColors = [];
    for (var i in data.userStats.theme) {
      themesLabels.push(i);
      themesNumbers.push(data.userStats.theme[i]);
      themesColors.push(themeColorsLabels[i]);
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
      macos: '#1FCEFF',
      ios: '#96E8FF',
      android: '#FFBE30',
      windows: 'blue',
      linux: '#45FF30',
      Unknown: 'lightgray'
    };
    var osNumbers = [];
    var osLabels = [];
    var osColors = [];
    for (var i in data.userStats.os) {
      osLabels.push(i);
      osNumbers.push(data.userStats.os[i]);
      osColors.push(osColorsLabels[i]);
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
      safari: '#96E8FF',
      chrome: 'red',
      firefox: '#FFBE30',
      edge: 'blue',
      ie: '#45FF30',
      Unknown: 'lightgray'
    };
    var browserNumbers = [];
    var browserLabels = [];
    var browserColors = [];
    for (var i in data.userStats.browser) {
      browserLabels.push(i);
      browserNumbers.push(data.userStats.browser[i]);
      browserColors.push(browserColorsLabels[i]);
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
});
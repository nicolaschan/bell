const config = require('./config.json');
const logger = require('loggy');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const fs = require('fs');
const shortid = require('shortid');
const async = require('async');
const redis = require('redis');
const _ = require('lodash');
const Sniffr = require('sniffr');
const crypto = require('crypto');
var client; // redis client

var connectToRedis = function(callback) {
  if (!config['enable redis']) {
    logger.warn('Redis disabled');
    return callback();
  }
  client = (config['redis password']) ? redis.createClient({
    password: config['redis password']
  }) : redis.createClient();

  client.on('ready', function() {
    logger.success('Redis connected');
    callback();
  });
  client.on('error', function(err) {
    logger.error(err);
  });
};
var startWebServer = function(callback) {
  var parseSchedules = function(text) {
    var outputSchedules = {};

    var lines = text.split('\n');

    var currentScheduleName;
    var currentSchedule;
    for (var i in lines) {
      var line = lines[i];
      if (line[0] == '*') {
        if (currentSchedule)
          outputSchedules[currentScheduleName] = currentSchedule;
        currentScheduleName = line.substring(2).split(' (')[0];
        currentSchedule = {
          displayName: line.split('(')[1].substring(0, line.split('(')[1].indexOf(')')),
          periods: []
        };
        if (line.indexOf('[') > -1)
          currentSchedule.color = line.split('[')[1].substring(0, line.split('[')[1].indexOf(']'));
      } else {
        if (!line)
          continue;
        var time = line.substring(0, line.indexOf(' '));
        var hour = time.split(':')[0];
        var minute = time.split(':')[1];
        var periodName = line.substring(line.indexOf(' ') + 1);

        currentSchedule.periods.push({
          name: periodName,
          time: [parseInt(hour), parseInt(minute)]
        });
      }
    }

    if (currentSchedule) {
      outputSchedules[currentScheduleName] = currentSchedule;
    }

    return outputSchedules;
  };
  var parseCalendar = function(text, schedules) {
    var calendar = {
      defaultWeek: [],
      specialDays: {}
    };

    var lines = text.split('\n');

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i];
      if (line == '* Default Week') {
        line = lines[++i];
        while (line && line[0] != '*') {
          calendar.defaultWeek.push(line.substring(2));
          line = lines[++i];
        }
      }
      if (line == '* Special Days') {
        line = lines[++i];

        while (line && line[0] != '*') {
          if (line.split(' ')[0].indexOf('-') > -1) {
            // is a range
            var date = new Date(line.split(' ')[0].split('-')[0]);
            var endDate = new Date(line.split(' ')[0].split('-')[1]);
            var scheduleName = line.split(' ')[1];
            var schedule = {
              scheduleName: scheduleName,
              customName: (line.indexOf('(') > -1) ? line.split('(')[1].substring(0, line.split('(')[1].indexOf(')')) : schedules[scheduleName].displayName
            };
            while (date.toDateString() != endDate.toDateString()) {
              calendar.specialDays[date.toDateString()] = schedule;
              date.setDate(date.getDate() + 1);
            }
            calendar.specialDays[endDate.toDateString()] = schedule;
          } else {
            // is not a range
            var date = new Date(line.split(' ')[0]);
            var scheduleName = line.split(' ')[1];
            calendar.specialDays[date.toDateString()] = {
              scheduleName: scheduleName,
              customName: (line.indexOf('(') > -1) ? line.split('(')[1].substring(0, line.split('(')[1].indexOf(')')) : schedules[scheduleName].displayName
            };
          }
          line = lines[++i];
        }
      }
    }

    return calendar;
  };
  var getVersion = function() {
    var hash = crypto.createHash('md5');
    return hash.update(fs.readFileSync('data/version.txt').toString()).digest('hex');
  };
  var getData = function() {
    var schedules = parseSchedules(fs.readFileSync('data/schedules.txt').toString());
    var calendar = parseCalendar(fs.readFileSync('data/calendar.txt').toString(), schedules);
    var correction = _.parseInt(fs.readFileSync('data/correction.txt').toString());
    var version = getVersion();

    return {
      schedules: schedules,
      calendar: calendar,
      correction: correction,
      version: version
    };
  };

  app.get('/', (req, res) => {
    res.render('index', {
      version: getVersion()
    });
  });

  //if (config['enable redis'])
  app.get('/stats', (req, res) => {
    res.render('stats', {
      version: getVersion()
    });
  })
  if (config['enable redis'])
    app.get('/api/stats', (req, res) => {
      var out = {};
      async.parallel([
        function(callback) {
          out.dailyStats = {};
          client.hgetall('dates', (err, dates) => {
            async.forEachOf(dates, (id, date, callback) => {
              client.get(`totalDailyHits:${id}`, (err, totalHits) => {
                client.scard(`deviceConnections:${id}`, (err, devices) => {
                  out.dailyStats[date] = {
                    totalHits: parseInt(totalHits),
                    devices: devices
                  };
                  callback(null);
                });
              });
            }, callback);
          });
        },
        function(callback) {
          out.userStats = {
            browser: {},
            os: {},
            theme: {}
          };
          client.hgetall('users', (err, users) => {
            async.forEachOf(users, (id, user, callback) => {
              client.hgetall(`users:${id}`, (err, data) => {
                if (!out.userStats.browser[data.browser])
                  out.userStats.browser[data.browser] = 0;
                out.userStats.browser[data.browser]++;
                if (!out.userStats.os[data.os])
                  out.userStats.os[data.os] = 0;
                out.userStats.os[data.os]++;
                if (!out.userStats.theme[data.theme])
                  out.userStats.theme[data.theme] = 0;
                out.userStats.theme[data.theme]++;
                callback();
              });
            }, callback);
          });
        }
      ], function(err) {
        res.json(out);
      });
    });
  app.get('/api/data', (req, res) => {
    res.set('Content-Type', 'text/json');
    res.send(getData());
  });
  app.get('/api/uuid', (req, res) => {
    res.set('Content-Type', 'text/json');
    res.send({
      id: shortid.generate()
    });
  });
  app.get('/api/time', (req, res) => {
    res.json({
      time: Date.now()
    });
  });

  var bodyParser = require('body-parser')
  app.use(bodyParser.json()); // to support JSON-encoded bodies
  app.use(bodyParser.urlencoded({ // to support URL-encoded bodies
    extended: true
  }));
  app.set('view engine', 'pug');

  app.post('/api/analytics', (req, res) => {
    if (!config['enable redis'])
      return res.json({
        success: false
      });
    var dateString = new Date().toLocaleDateString();
    //var dateString = '' + date.getFullYear() + date.getMonth() + date.getDate();
    var ensureDateId = function(callback) {
      client.hget('dates', dateString, (err, res) => {
        if (!res) {
          client.incr('date_id', (err, id) => {
            client.hset('dates', dateString, id);
            callback(id);
          });
        } else {
          callback(res);
        }
      });
    };
    var addId = function(id) {
      if (req.body.newPageLoad != 'true')
        return;

      //var now = Date.now();
      client.sismember(`deviceConnections:${id}`, req.body.id, (err, res) => {
        if (!res) {
          client.sadd(`deviceConnections:${id}`, req.body.id);
          //client.rpush(`deviceConnectionsTimes:${id}`, now);
        }
      });

      client.incr(`totalDailyHits:${id}`);
      //client.rpush(`totalHitsTimes:${id}`, now);
    };
    ensureDateId(addId);


    var ensureUserId = function(callback) {
      client.hget('users', req.body.id, (err, res) => {
        if (!res) {
          client.incr('user_id', (err, id) => {
            client.hset('users', req.body.id, id);
            callback(null, id);
          });
        } else {
          callback(null, res);
        }
      });
    };
    var updateUserInfo = function(id, callback) {
      var s = new Sniffr();
      s.sniff(req.body.userAgent)
      client.hmset(`users:${id}`, 'browser', s.browser.name, 'os', s.os.name, 'theme', req.body.theme, 'last seen', Date.now(), callback);
    };
    ensureUserId(function(err, id) {
      updateUserInfo(id);
    });

    res.json({
      success: true
    });
  });
  app.get('/api/themes', (req, res) => {
    res.set('Content-Type', 'text/json');
    res.sendFile(__dirname + '/data/themes.json');
  });

  app.use('/favicons', express.static('favicons'));
  app.use('/js', express.static('js'));
  app.use('/css', express.static('css'));

  server.listen(config.port, function() {
    logger.success('Web server listening on *:' + config.port);
    callback();
  });
};

async.parallel([
  connectToRedis,
  startWebServer
], function(err) {
  logger.success('Ready!');
});
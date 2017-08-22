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
const timesyncServer = require('timesync/server');

var connectToRedis = function(callback) {
  if (!config['enable redis']) {
    logger.warn('Redis disabled');
    return callback();
  }
  client = (config['redis password']) ? redis.createClient({
    host: config['redis host'],
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
  var previousCheck = 0;
  var currentVersion;
  var getVersion = function() {
    if (Date.now() - previousCheck < 1000 * 60 && currentVersion) return currentVersion;

    previousCheck = Date.now();
    var hash = crypto.createHash('md5');
    currentVersion = hash.update(fs.readFileSync('data/version.txt').toString()).digest('hex');
    return currentVersion;
  };
  var getCorrection = function() {
    return _.parseInt(fs.readFileSync('data/correction.txt').toString());
  };
  var getSchedules = function() {
    return fs.readFileSync('data/schedules.txt').toString();
  };
  var getCalendar = function() {
    return fs.readFileSync('data/calendar.txt').toString();
  };

  app.get('/', (req, res) => {
    res.render('index', {
      version: getVersion(),
      server_name: config['server name']
    });
  });
  app.get('/blog', (req, res) => {
    res.render('blog');
  });
  app.get('/xt', (req, res) => {
    res.redirect('https://chrome.google.com/webstore/detail/belllahsclub-extension/pkeeekfbjjpdkbijkjfljamglegfaikc');
  });
  app.get('/extension', (req, res) => {
    res.redirect('https://chrome.google.com/webstore/detail/belllahsclub-extension/pkeeekfbjjpdkbijkjfljamglegfaikc');
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
                if (!data)
                  return callback();
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
  app.get('/api/correction', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(getCorrection().toString());
  });
  app.get('/api/calendar', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(getCalendar());
  });
  app.get('/api/schedules', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(getSchedules());
  });
  app.get('/api/version', (req, res) => {
    res.set('Content-Type', 'text/plain');
    res.send(getVersion());
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
  app.use('/timesync', timesyncServer.requestHandler);

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
      client.hmset(`users:${id}`, 'userAgent', req.body.userAgent, 'browser', s.browser.name, 'os', s.os.name, 'theme', req.body.theme, 'last seen', Date.now(), callback);
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
  app.use('/bin', express.static('bin'));
  app.use('/css', express.static('css'));
  app.use('/img', express.static('img'));

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
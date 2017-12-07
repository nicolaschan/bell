const Promise = require('bluebird');

const config = require('./config.json');
const logger = require('loggy');
const http = require('http');
const express = require('express');
const app = express();
const server = http.createServer(app);
const fs = Promise.promisifyAll(require('fs'));
const path = require('path');
const shortid = require('shortid');
const async = require('async');
const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const request = Promise.promisifyAll(require('request'));
const _ = require('lodash');
const Sniffr = require('sniffr');
const crypto = require('crypto');
var client; // redis client
const timesyncServer = require('timesync/server');
const base64Img = require('base64-img');

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
    var cache = function(time, f) {
        // takes a function and caches its result
        // for a set number of seconds

        var previousCheck = 0;
        var cache = {};

        return function() {
            if (Date.now() - previousCheck > 1000 * time)
                cache = {};

            argumentString = JSON.stringify(arguments);

            if (!cache[argumentString]) {
                previousCheck = Date.now();
                cache[argumentString] = f.apply(null, arguments);
            }

            return cache[argumentString];
        };
    };

    var previousCheck = 0;
    var currentVersion;
    var getVersion = cache(60, function() {
        var hash = crypto.createHash('md5');
        currentVersion = hash.update(fs.readFileSync('data/version.txt').toString()).digest('hex');
        return currentVersion;
    });
    var getMessage = cache(60, function() {
        return JSON.parse(fs.readFileSync(`./data/message.json`).toString());
    });

    var fetch = async function(source, file) {
        var sourceData = await getSource(source);
        switch (sourceData.location) {
            case 'local':
                var res = await fs.readFileAsync(`data/${source}/${file}`);
                return res.toString();
            case 'web':
                var res = await request.getAsync(`${sourceData.url}/api/data/${source}/${file.split('.')[0]}`);
                return res.body;
            case 'github':
                var pieces = sourceData.repo.split('/');
                var usernameRepo = pieces.slice(0, 2).join('/');
                var path = pieces.slice(2).join('/');
                var res = await request.getAsync(`https://raw.githubusercontent.com/${usernameRepo}/master/${path}/${file}`);
                return res.body;
        }
    };
    var getCorrection = cache(60, async function(source) {
        return fetch(source, 'correction.txt');
    });
    var getSchedules = cache(60, async function(source) {
        return fetch(source, 'schedules.txt');
    });
    var getCalendar = cache(60, async function(source) {
        return fetch(source, 'calendar.txt');
    });
    var getMeta = cache(60, async function(source) {
        var meta = await fetch(source, 'meta.json');
        return JSON.parse(meta);
    });
    var getSource = cache(60, async function(source) {
        // if (source.substring(0, 3) == 'gh:') {
        //     return {
        //         location: 'github',
        //         repo: source.substring(3).split(':').join('/')
        //     };
        // }
        var source = await fs.readFileAsync(`data/${source}/source.json`);
        return JSON.parse(source.toString());
    });


    app.get('/', (req, res) => {
        res.render('client-mithril');
    });
    app.get('/legacy', (req, res) => {
        res.render('index', {
            version: getVersion(),
            server_name: config['server name'],
            message: getMessage()
        });
    });
    app.get('/periods', (req, res) => {
        res.render('periods');
    });
    app.get('/classes', (req, res) => {
        res.render('classes');
    });
    app.get('/enter', (req, res) => {
        res.render('enter');
    });
    app.get('/settings', (req, res) => {
        res.render('settings');
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
    });
    if (config['enable redis'])
        app.get('/api/stats', async(req, res) => {
            var out = {
                dailyStats: {},
                userStats: {
                    browser: {},
                    os: {},
                    theme: {},
                    source: {}
                }
            };

            var dates = await client.hgetallAsync('dates');
            for (let date in dates) {
                var id = dates[date];
                var totalHits = await client.getAsync(`totalDailyHits:${id}`);
                var devices = await client.scardAsync(`deviceConnections:${id}`);

                out.dailyStats[date] = {
                    totalHits: parseInt(totalHits),
                    devices: devices
                };
            }

            var users = await client.hgetallAsync('users');
            for (let user in users) {
                var id = users[user];
                var data = await client.hgetallAsync(`users:${id}`);
                if (!data)
                    continue;
                if (!out.userStats.browser[data.browser])
                    out.userStats.browser[data.browser] = 0;
                out.userStats.browser[data.browser]++;
                if (!out.userStats.os[data.os])
                    out.userStats.os[data.os] = 0;
                out.userStats.os[data.os]++;
                if (!out.userStats.theme[data.theme])
                    out.userStats.theme[data.theme] = 0;
                out.userStats.theme[data.theme]++;
                if (!out.userStats.source[data.source])
                    out.userStats.source[data.source] = 0;
                out.userStats.source[data.source]++;
            }

            return res.json(out);
        });

    app.get('/api/sources', async(req, res) => {
        var directories = fs.readdirSync('data').filter(name => fs.lstatSync(path.join('data', name)).isDirectory());

        var sources = [];
        for (let directory of directories) {
            var source = await getMeta(directory);
            source.id = directory;
            sources.push(source);
        }

        res.json(sources);
    });
    app.get('/api/sources/names', async(req, res) => {
        var directories = fs.readdirSync('data').filter(name => fs.lstatSync(path.join('data', name)).isDirectory());
        res.json(directories);
    });

    app.get('/api/data/:source/meta', (req, res) => {
        getMeta(req.params.source).then(meta => res.json(meta));
    });
    app.get('/api/data/:source/correction', (req, res) => {
        res.set('Content-Type', 'text/plain');
        getCorrection(req.params.source).then(correction => res.send(correction ? correction.toString() : '0'));
    });
    app.get('/api/data/:source/calendar', (req, res) => {
        res.set('Content-Type', 'text/plain');
        getCalendar(req.params.source).then(calendar => res.send(calendar));
    });
    app.get('/api/data/:source/schedules', (req, res) => {
        res.set('Content-Type', 'text/plain');
        getSchedules(req.params.source).then(schedules => res.send(schedules));
    });
    app.get('/api/version', (req, res) => {
        res.set('Content-Type', 'text/plain');
        res.send(getVersion());
    });
    app.get('/api/message', (req, res) => {
        res.json(getMessage());
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

    // For converting images
    // app.get('/api/favicons/:color', (req, res) => {
    //   base64Img.base64(`${__dirname}/favicons/${req.params.color}.png`, (err, data) => {
    //     res.set('Content-Type', 'text/plain');
    //     res.send(data);
    //   });
    // });

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
            client.hmset(`users:${id}`, 'source', req.body.source, 'userAgent', req.body.userAgent, 'browser', s.browser.name, 'os', s.os.name, 'theme', req.body.theme, 'last seen', Date.now(), callback);
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
    app.get('/css/clockpicker.css', (req, res) => {
        res.sendFile(__dirname + '/node_modules/clockpicker/dist/jquery-clockpicker.min.css')
    });
    app.get('/css/selectize.css', (req, res) => {
        res.sendFile(__dirname + '/node_modules/selectize/dist/css/selectize.default.css');
    });

    app.use('/favicons', express.static('favicons'));
    app.use('/bin', express.static('bin'));
    app.use('/css', express.static('css'));
    app.use('/img', express.static('img'));
    app.use('/icons', express.static('node_modules/material-design-icons'));
    app.use('/fonts', express.static('node_modules/roboto-fontface/fonts'));

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
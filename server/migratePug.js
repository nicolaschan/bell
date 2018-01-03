#!/usr/local/bin/node

const fs = require('fs');
const pug = require('pug');

// Converts pug files to html to be served statically
var src = '../views/'
var dest = 'web/static/';

var migratePug = function() {
    // Top level .pug files that need to be compiled to HTML
    var toMigrate = ['client-mithril', 'periods', 'classes', 'enter', 'settings', 'blog', 'stats'];

    for (file of toMigrate) {
        var html = pug.renderFile(src + file + '.pug', { basedir: "./web/static/" });
        var target = dest + file + '.html';
        fs.writeFile(target, html, function(err) {
            if (err) {
                console.log("Error writing " + target);
                console.log(err);
                process.exit(1);
            }
            console.log("Successfully wrote " + target);
        });
    }
}

migratePug()
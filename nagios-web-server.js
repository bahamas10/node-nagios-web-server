#!/usr/bin/env node
/**
 * A CGI / PHP node runner script to replace Apache for Nagios
 *
 * Author: Dave Eddy <dave@daveeddy.com>
 * Date: May 19, 2015
 * License: MIT
 */

var http = require('http');
var path = require('path');
var spawn = require('child_process').spawn;
var url = require('url');

var accesslog = require('access-log');
var cgi = require('cgi');
var getopt = require('posix-getopt');
var jsprim = require('jsprim');

var package = require('./package.json');

var opts = {
  host: process.env.NAGIOS_WEB_SERVER_HOST || '0.0.0.0',
  port: process.env.NAGIOS_WEB_SERVER_PORT || 8085,
  phpdir: process.env.NAGIOS_WEB_SERVER_PHPDIR || '/opt/local/share/nagios',
  cgidir: process.env.NAGIOS_WEB_SERVER_CGIDIR || '/opt/local/libexec/nagios/cgi-bin',
  user: process.env.NAGIOS_WEB_SERVER_USER || 'nagiosadmin',
  header: process.env.NAGIOS_WEB_SERVER_HEADER,
  cgicfg: process.env.NAGIOS_WEB_CGI_CONFIG,
};

var usage = [
  'usage: nagios-web-server [options]',
  '',
  'options',
  '  -c, --cgi-dir <dir>       [env NAGIOS_WEB_SERVER_CGIDIR] the directory where nagios CGI scripts live, defaults to ' + opts.cgidir,
  '  -H, --host <host>         [env NAGIOS_WEB_SERVER_HOST] the host on which to listen, defaults to ' + opts.host,
  '  -h, --help                print this message and exit',
  '  -P, --php-dir <dir>       [env NAGIOS_WEB_SERVER_PHPDIR] the directory where nagios PHP scripts live, defaults to ' + opts.phpdir,
  '  -p, --port <port>         [env NAGIOS_WEB_SERVER_PORT] the port on which to listen, defaults to ' + opts.port,
  '  -U, --user <user>         [env NAGIOS_WEB_SERVER_USER] username to login to nagios CGI scripts, defaults to ' + opts.user,
  '  -u, --updates             check npm for available updates',
  '  -v, --version             print the version number and exit',
].join('\n');

var options = [
  'c:(cgi-dir)',
  'H:(host)',
  'h(help)',
  'P:(php-dir)',
  'p:(port)',
  'u(updates)',
  'v(version)'
].join('');
var parser = new getopt.BasicParser(options, process.argv);
var option;
while ((option = parser.getopt()) !== undefined) {
  switch (option.option) {
    case 'c': opts.cgidir = option.optarg; break;
    case 'H': opts.host = option.optarg; break;
    case 'h': console.log(usage); process.exit(0); break;
    case 'P': opts.phpdir = option.optarg; break;
    case 'p': opts.port = parseInt(option.optarg, 10); break;
    case 'U': opts.user = option.optarg; break;
    case 'u': // check for updates
      require('latest').checkupdate(package, function(ret, msg) {
        console.log(msg);
        process.exit(ret);
      });
      return;
    case 'v': console.log(package.version); process.exit(0); break;
    default: console.error(usage); process.exit(1);
  }
}

var staticroute = require('static-route')({
  dir: opts.phpdir,
  autoindex: false,
  tryfiles: [],
});

// start the server
http.createServer(onrequest).listen(opts.port, opts.host, onlisten);

function onlisten() {
  console.log('listening on http://%s:%d', opts.host, opts.port);
}

function onrequest(req, res) {
  accesslog(req, res);
  var uri = url.parse(req.url);
  var normalized = path.normalize(uri.pathname);

  // check CGI
  var match = uri.pathname.match(/\/cgi-bin(\/[^\/]+)/);
  if (match) {
    var script = path.join(opts.cgidir, path.normalize(match[1]));
    var cgiopts = {
      env: {
        REMOTE_USER: opts.header && req.headers[opts.header] || opts.user,
      }
    };
    if (opts.cgicfg) {
      cgiopts.env.NAGIOS_CGI_CONFIG = opts.cgicfg;
    }
    res.setHeader('Access-Control-Allow-Origin', '*');
    cgi(script, cgiopts)(req, res);
    return;
  }

  // check PHP
  var f = path.join(opts.phpdir, normalized);
  if (/\/$/.test(f))
    f += 'index.php';
  if (path.extname(f) === '.php') {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');

    var phpopts = {
      env: jsprim.deepCopy(process.env)
    };
    phpopts.env.REMOTE_USER = opts.header && req.headers[opts.header] || opts.user;
    var child = spawn('php', [f], phpopts);
    child.stdout.pipe(res);
    child.stderr.pipe(process.stderr);
    child.on('close', function(code) {
      res.statusCode = code === 0 ? 200 : 500;
      res.end();
    });
    return;
  }

  // default to staticroute
  staticroute(req, res);
}

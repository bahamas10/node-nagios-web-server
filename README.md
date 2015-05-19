Nagios Web Server
=================

A CGI / PHP node runner script to replace Apache for Nagios

Installation
------------

    [sudo] npm install -g nagios-web-server

Example
-------

    $ nagios-web-server -H 0.0.0.0 -p 8080 -c /opt/local/libexec/nagios-cgi-bin -P /opt/local/share/nagios
    listening on http://0.0.0.0:8080
    PHP Warning:  date(): It is not safe to rely on the system's timezone settings. You are *required* to use the date.timezone setting or the date_default_timezone_set() function. In case you used any of those methods and you are still getting this warning, you most likely misspelled the timezone identifier. We selected the timezone 'UTC' for now, but please set date.timezone to select your timezone. in /opt/local/share/nagios/index.php on line 53
    10.0.1.229 - - [19/May/2015:12:57:50 -0400] "GET / HTTP/1.1" 200 - "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36"
    10.0.1.229 - - [19/May/2015:12:57:50 -0400] "GET / HTTP/1.1" 200 - "-" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36"
    10.0.1.229 - - [19/May/2015:12:57:50 -0400] "GET /side.php HTTP/1.1" 200 - "http://nagios.rapture.com:8085/" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36"

Usage
-----

    $ nagios-web-server -h
    usage: nagios-web-server [options]

    options
      -c, --cgi-dir <dir>       [env NAGIOS_WEB_SERVER_CGIDIR] the directory where nagios CGI scripts live, defaults to /opt/local/libexec/nagios/cgi-bin
      -H, --host <host>         [env NAGIOS_WEB_SERVER_HOST] the host on which to listen, defaults to 0.0.0.0
      -h, --help                print this message and exit
      -P, --php-dir <dir>       [env NAGIOS_WEB_SERVER_PHPDIR] the directory where nagios PHP scripts live, defaults to /opt/local/share/nagios
      -p, --port <port>         [env NAGIOS_WEB_SERVER_PORT] the port on which to listen, defaults to 8085
      -U, --user <user>         [env NAGIOS_WEB_SERVER_USER] username to login to nagios CGI scripts, defaults to nagiosadmin
      -u, --updates             check npm for available updates
      -v, --version             print the version number and exit

License
-------

MIT License

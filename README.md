speedlog
========

Logs speed test results at a set interval

What it does
------------

1. Runs internet speed tests via speedtest.net at set intervals 
2. Saves results to designated CSV file

Installation
------------

Install bks
```bash
$ npm install speedlog -g
```

Getting started
---------------

```bash
$ speedlog
```

You will be prompted for the following info:

**Cron pattern**  
The interval to conduct speed tests, in the form of cron syntax. Default is `0,30 * * * *` (every 30 mins).

**Test duration**
The maximum length of a single test run (upload or download), in seconds	

**CSV data output file path**  
Where to save the speed test results. Data will be appended to this doc. File will be created if it doesn't exist.

Disclaimer
----------

### Release History ###

- v0.1.0 - Initial release

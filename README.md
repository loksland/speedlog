speedlog
========

Command line utility that logs speedtest.net results at a set interval to a local CSV file

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

**Note**  
Please note that private data, such as your IP, will be included in the speed results written to file.

Disclaimer
----------

### Release History ###

- v0.1.3 - Docs update
- v0.1.2 - Removed unnecessary column
- v0.1.1 - Docs update
- v0.1.0 - Initial release

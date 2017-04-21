#! /usr/bin/env node

var CronJob = require('cron').CronJob; 
const speedTest = require('speedtest-net');
var readlineSync = require('readline-sync');
var settings = require('user-settings').file('.speedlog-settings');
var utils = require('./utils');
var path = require('path'); 
var fs = require('fs'); 
var moment = require('moment');

function SpeedLog(){
	
	
	//var cronPattern = '0,30 * * * *'; // every 30 mins
	//var testRunDuration = 10; //  the maximum length of a single test run (upload or download), in seconds	
	//var timeZone = 'Australia/Brisbane';
	
	
	var CSV_SEPARATOR_CHAR = ',';
	var CSV_NEWLINE_CHAR = '\r\n';
	
	
	var COLS = [];
	COLS = COLS.concat(['time']);
	COLS = COLS.concat(['simple.test','speeds.download', 'speeds.upload', 'speeds.originalDownload','speeds.originalUpload']);
	COLS = COLS.concat(['client.ip', 'client.lat', 'client.lon', 'client.isp', 'client.isprating', 'client.rating', 'client.ispdlavg', 'client.ispulavg']);
	COLS = COLS.concat(['server.host','server.lat','server.lon','server.location','server.country','server.cc','server.sponsor','server.distance','server.distanceMi','server.ping','server.id']);
	COLS = COLS.concat(['error']);
	
	/*

		var data = { speeds: 
		 { download: 11.146,
			 upload: 1.343,
			 originalDownload: 1227559,
			 originalUpload: 147336 },
		client: 
		 { ip: '123.123.123.1',
			 lat: -47.1234,
			 lon: 123.1234,
			 isp: 'iiNet',
			 isprating: 3,
			 rating: 1,
			 ispdlavg: 8.201,
			 ispulavg: 1.332 },
		server: 
		 { host: 'brs1.speedtest.telstra.net',
			 lat: -27.4728,
			 lon: 153.0278,
			 location: 'Brisbane',
			 country: 'Australia',
			 cc: 'AU',
			 sponsor: 'Telstra',
			 distance: 0.22,
			 distanceMi: 0.59,
			 ping: 34.2,
			 id: '2604' } };
		 
	*/


	// cron pattern
	
	console.log('');
	var cronPatternDefault = settings.get('cron-pattern');
	if (!utils.isSet(dataFileDefault)){
		cronPatternDefault = '0,30 * * * *'; // every 30 mins
	}
	var cronPattern = readlineSync.question('Cron pattern?\n' + (utils.isSet(cronPatternDefault) ? '('+cronPatternDefault+')\n' : ''), {
		defaultInput: cronPatternDefault // The typed text on screen is hidden by `*` (default). 
	});
	cronPattern = escapeShell(cronPattern);
	if (!utils.isSet(cronPattern)){
		throw new Error('Invalid input');
	}	
	settings.set('cron-pattern', cronPattern);
	if (!utils.isSet(cronPatternDefault)){
		console.log('');
	}	
	
	// test duration
	
	console.log('');
	var testRunDurationDefault = settings.get('test-run-duration');
	if (!utils.isSet(testRunDurationDefault)){
		testRunDurationDefault = 15; // 15 seconds
	}
	var testRunDuration = readlineSync.question('Test duration?\n' + (utils.isSet(testRunDurationDefault) ? '('+testRunDurationDefault+')\n' : ''), {
		defaultInput: testRunDurationDefault // The typed text on screen is hidden by `*` (default). 
	});
	testRunDuration = escapeShell(testRunDuration);
	if (!utils.isSet(testRunDuration)){
		throw new Error('Invalid input');
	}	
	settings.set('test-run-duration', testRunDuration);
	if (!utils.isSet(testRunDurationDefault)){
		console.log('');
	}	
	
	// output file location
	
	// ask where user would like to save csv data
	console.log('');
	var dataFileDefault = settings.get('data-file');
	var dataFile = readlineSync.question('CSV data output file path?\n' + (utils.isSet(dataFileDefault) ? '('+dataFileDefault+')\n' : ''), {
		defaultInput: dataFileDefault // The typed text on screen is hidden by `*` (default). 
	});
	dataFile = escapeShell(dataFile);
	if (!fs.existsSync(dataFile)){
		fs.writeFileSync(dataFile, '', 'utf8');
	}
	if (fs.statSync(dataFile).isDirectory() || !utils.isFileOfExtension(dataFile, 'csv')){
		throw new Error('Invalid input, must not be a dir and have ext `.csv`');
	}	
	settings.set('data-file', dataFile);
	if (!utils.isSet(dataFileDefault)){
		console.log('');
	}
	

	

	// write col headings to CSV if file empty
	var existingData = fs.readFileSync(dataFile, 'utf8');
	if (existingData.length == 0 || existingData.split(CSV_NEWLINE_CHAR).length == 1){
		appendCSVRow(COLS	,dataFile, CSV_SEPARATOR_CHAR,CSV_NEWLINE_CHAR, true); 
	}
	
	console.log('[speedlog] waiting...');
	
	var job = new CronJob(cronPattern, function() {
	
		var testTime = moment().format('DD/MM/YYYY h:mm:ss a');
		console.log('[speedlog] `'+testTime+'` measuring speed...');
		
		try {
		
			speedTest.visual({maxTime: testRunDuration*1000}, (err, data) => {
		
				if (err){
					console.error(err);
					writeObjToCSV({time:testTime,error:err.message}, dataFile, COLS, CSV_SEPARATOR_CHAR,CSV_NEWLINE_CHAR);
					return;
				}
		
				console.log('[speedtest] got data:');
				console.dir(data);
		
				data.time = testTime;
				writeObjToCSV(data, dataFile, COLS, CSV_SEPARATOR_CHAR,CSV_NEWLINE_CHAR);
				
				console.log('[speedlog] waiting...');
	
			});
	
		} catch(err) {
			console.error(err);
			writeObjToCSV({time:testTime,error:err.message}, dataFile, COLS, CSV_SEPARATOR_CHAR,CSV_NEWLINE_CHAR);
		}
	
  }, function () {
   console.log('[speedlog] stopped');
  },
  true//, /* Start the job right now */
  //timeZone /* Time zone of this job. */
	);
	
	


}



function writeObjToCSV(obj, filePath, cols, separatorChar, newlineChar){

	var rowArr = [];
	for (var i = 0; i < cols.length; i++){
		
		var cellNest = cols[i].split('.');		
		var val = obj;
		for (var j = 0; j < cellNest.length; j++){
			if (typeof val[cellNest[j]] !== 'undefined'){
				val = val[cellNest[j]];
			}
		}
		if (typeof val === 'object'){
			val = '';
		}
		rowArr.push(val);
		
	}
	
	appendCSVRow(rowArr	,filePath, separatorChar, newlineChar); 

}

function appendCSVRow(arr, filePath, separatorChar, newlineChar, silentMode){

	silentMode = typeof silentMode !== 'undefined' ? silentMode : false;
	
	var row = '';
	for (var i = 0; i < arr.length; i++){
		var cell = String(arr[i]);
		cell = cell.split('"').join('“');
		cell = cell.split(newlineChar).join(' ');
		if (cell.split(separatorChar).length > 1){
			cell = '"' + cell + '"'; 
		}	
		if (row.length > 0){
			row += separatorChar;
		}
		row += cell;
	}
	row+=newlineChar;

	fs.appendFile(filePath, row, 'utf8', function (err) {
		
		if (err){
			console.error(err); // don't throw an error
			return;
		}
		
		if (!silentMode){
			console.log('[speedlog] wrote to `'+filePath+'` ok');
		}
		
	});

}

function escapeShell(cmd) {
  return cmd.split("\\ ").join(' ');
};


module.exports = new SpeedLog;

var express = require('express');
var router = express.Router();

var fs = require('fs');
var util = require('util');
var request = require('request');
var url = "https://www.youtube.com/embed/ugsk4Zq_2f4";

var clientId = 'test-app';                             // Can be anything
var clientSecret = '5b221051b27d4d26afdbfe69e5561426'; // API key from Azure marketplace
var finalString;
var storeData;

var languages = [];


getAccessToken(clientId, clientSecret, function(err, accessToken) {
  if(err) return console.log(err+"A");
  console.log('Got access token: ' + accessToken)
  
    speechToText(__dirname+'/SampLecture.wav', accessToken, function(err, res) {
      if(err) return console.log("R" + err);
      	finalString = res.results[0].lexical;
      	//console.log(finalString);

        getTranslation(finalString, 'en', 'es');
        getTranslation(finalString, 'en', 'fr');
        getTranslation(finalString, 'en', 'de');
        getTranslation(finalString, 'en', 'it');
   
  });
});


function getTranslation(input, original, language)
{
	var MsTranslator = require('mstranslator');
	// Second parameter to constructor (true) indicates that
	// the token should be auto-generated.

	var client = new MsTranslator({
  		client_id: "TextTranslator_test"
  ,	 	client_secret: "ZmdbtUc3bTfley6MdukTnP7kRZheoJoUe+fTFqgswdU="
	}, true);

	var params = {
  		text: input
  	, 	from: original
  	, 	to: language
	};	
	// Don't worry about access token, it will be auto-generated if needed.	
	storeData=client.translate(params, function(err, data) { 

    storeData = data; 

    languages.push(data);
    //console.log(finalString);
    //console.log(data);
    //console.log(languages);
    var stream = fs.createWriteStream("output.txt");
    stream.once('open', function(fd) {
    stream.write(finalString+"\n \n");
    stream.write(data+"\n");
    stream.end();
});

  });

	return storeData;
	
}


// ==== Helpers ====

function getAccessToken(clientId, clientSecret, callback) {
  request.post({
    url: 'https://oxford-speech.cloudapp.net/token/issueToken',
    form: {
      'grant_type': 'client_credentials',
      'client_id': encodeURIComponent(clientId),
      'client_secret': encodeURIComponent(clientSecret),
      'scope': 'https://speech.platform.bing.com'
    }
  }, function(err, resp, body) {
    if(err) return callback(err);
    try {
      var accessToken = JSON.parse(body).access_token;
      if(accessToken) {
        callback(null, accessToken);
      } else {
        callback(body);
      }
    } catch(e) {
      callback(e);
    }
  });
}

function speechToText(filename, accessToken, callback) {
  fs.readFile(filename, function(err, waveData) {
    if(err) return callback(err);
    request.post({
      url: 'https://speech.platform.bing.com/recognize/query',
      qs: {
        'scenarios': 'ulm',
        'appid': 'D4D52672-91D7-4C74-8AD8-42B1D98141A5', // This magic value is required
        'locale': 'en-US',
        'device.os': 'wp7',
        'version': '3.0',
        'format': 'json',
        'requestid': '1d4b6030-9099-11e0-91e4-0800200c9a66', // can be anything
        'instanceid': '1d4b6030-9099-11e0-91e4-0800200c9a66' // can be anything
      },
      body: waveData,
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        'Content-Type': 'audio/wav; samplerate=16000',
        'Content-Length' : waveData.length
      }
    }, function(err, resp, body) {
      if(err) return callback(err);
      try {
        callback(null, JSON.parse(body));
      } catch(e) {
        callback(e);
      }
    });
  });
}

/*GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { allLanguages: languages });
});


module.exports = router;

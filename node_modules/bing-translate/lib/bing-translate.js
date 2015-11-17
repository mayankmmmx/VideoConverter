var https = require('https'),
  http = require('http'),
  querystring = require('querystring'),
  client = {},
  credentials = {},
  regx = /<string [a-zA-Z0-9=":/.]+>(.*)<\/string>/;

exports.init = function(creds){
  client.credentials = creds;
  return client;
}

client.setCredentials = function(creds){
  client.credentials = creds;
}

client.translate = function(text, from, to, callback){
  client.getToken(client.credentials, function(err, token){
    var req = http.request({
      host: 'api.microsofttranslator.com',
      port: 80,
      path: '/V2/Http.svc/Translate?text='+encodeURIComponent(text)+'&from='+from+'&to='+to+'&contentType=text/plain',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer '+token.access_token
      }
    });
    req.on('response', function(response){
      var data = '';
      response.on('data', function(chunk){
        data += chunk;
      });
      response.on('end', function(){
        var error, translation;
        try {
          translation = regx.exec(data)[1];
        } catch(e) {
          error = 'parse-exception';
        }
        callback(error, {
          original_text: text,
          translated_text: translation,
          from_language: from,
          to_language: to,
          response: data
        });
      });
    });
    req.on('error', function(e){
      callback(new Error(e.message), null);
    });
    req.end();
  });
}

client.getToken = function(credentials, callback){
  var post_data = querystring.stringify({
    'grant_type': 'client_credentials',
    'scope': 'http://api.microsofttranslator.com',
    'client_id': credentials.client_id,
    'client_secret': credentials.client_secret
  });
  var req = https.request({
    hostname: 'datamarket.accesscontrol.windows.net',
    port: 443,
    path: '/v2/OAuth2-13/',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': post_data.length
    },
  }, function(res){
    res.setEncoding('utf8');
    res.on('data', function(response){
      callback(null, JSON.parse(response));
    });  
  });  
  req.on('error', function(e){
    callback(new Error(e.message), null);
  });
  req.write(post_data);
  req.end();
}
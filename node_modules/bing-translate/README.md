bing-translate
==============

Bing Translator module for node.js

## Installation

```js
$ npm install bing-translate
```

## API

```js
var bt = require('./lib/bing-translate.js').init({
    client_id: 'your_client_id', 
    client_secret: 'your_client_secret'
  });

bt.translate('This hotel is located close to the centre of Paris.', 'en', 'ro', function(err, res){
  console.log(err, res);
});
```

## Language List Reference

Please refer to [this link](https://msdn.microsoft.com/en-us/library/hh456380.aspx) for the
complete list of the languages supported by BING.
// include express package
var express = require('express');

// include file system package
var fs = require('fs');

// create an http server
var app = express();

// handle incoming requests to the "/" endpoint
app.get('/', function (request, response) {
  fs.readFile('index.html', function(error, html) {
    response.send(html.toString());
  });
});

// handle blog post creation
app.post('/posts', function(request, response) {
  response.send('post created!');
});

// listen for incoming requests
app.listen(3000, function () {
  console.log('Example app listening on port 3000!');
});

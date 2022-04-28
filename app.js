/*eslint-env node*/
const HOST = '0.0.0.0';
const PORT = 8080;

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');
const url = require('url');
const quertstring = require('querystring');
const bodyParser = require('body-parser');

// create a new express server
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

//start the server
const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`server starting on http://localhost:${port}`);
});
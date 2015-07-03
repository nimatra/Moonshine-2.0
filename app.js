
"use strict";
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var index = require('./routes/index');
var authenticate = require('./routes/authenticate');
var calendar = require('./routes/calendar');

var app = express();
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

var authRouter = express.Router({ mergeParams: true });

//app.use('/', routes);
//app.use('/calendars', calendars);

app.use('/authenticate', authRouter);
authRouter.use('/callback', authenticate.authorize);
authRouter.use('/', authenticate.callback);

/* Include the app engine handlers to respond to start, stop, and health checks. */
app.use(require('./lib/appengine-handlers'));



var port = process.env.PORT || 1337;

// [START hello_world]
/* Say hello! */
//app.get('/', index);

app.get('/', function(req, res) {
  res.status(200).send("Hello, world!");
});
// [END hello_world]

// [START server]
/* Start the server */
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function() {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]
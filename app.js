
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var authenticate = require('./routes/authenticate');
var calendars = require('./routes/calendars');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes

var authRouter = express.Router({mergeParams: true});
var calendarRouter = express.Router({mergeParams: true});

// [START]
app.get('/', index);
app.use('/authenticate', authRouter);
authRouter.use('/callback', authenticate.callback);
authRouter.use('/', authenticate.authorize);
app.use('/calendars', calendarRouter);
calendarRouter.use('/', calendars.listCalendars);
// [END]

// [START server]
var server = app.listen(process.env.PORT || '8080', '0.0.0.0', function () {
  console.log('App listening at http://%s:%s', server.address().address, server.address().port);
  console.log("Press Ctrl+C to quit.");
});
// [END server]

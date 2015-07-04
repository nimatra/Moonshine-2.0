var express = require('express');
var https = require('https');
var urlencode = require('urlencode');
var calendar = require('./calendar');

var router = express.Router();
module.exports = router;

/**
 * Lists all the calendars user has
 * it first checks and redirects the events loading call to the calendar route
 * /calendars?accessToken=<accessToken>
 * /calendars/<calendarID>/events?accessToken=<accessToken>
 * @param req
 * @param res
 */
router.listCalendars = function (req, res) {
  // since /calendars/ and /calendars/* calls are routed to the same router we need to redirect them here
  if (req.originalUrl.substr(0, '/calendars/'.length) == '/calendars/') {
    calendar.events(req, res);
    return;
  }
  if(req.query.accessToken == null) {
    res.render('calendars', {
      title: 'accessToken Parameter Missing',
      body: 'Moonshine cannot talk to Google Calendar without an access token'
    });
    return;
  }
  router.token = req.query.accessToken;

  var options = {
    host: 'www.googleapis.com',
    path: '/calendar/v3/users/me/calendarList?access_token=' + router.token,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  var httpsRequest = https.request(options, calendarApiCallback);
  httpsRequest.end();
  router.res = res;
};

/**
 * List calendar callback, calls parse when response is received
 * @param response
 */
function calendarApiCallback(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var calendars = JSON.parse(str);
    listCalendars(calendars);
  });
}
// calendar ids are not url friendly we need to create a urlencoded copy of them and pass it to the view
router.calendarIdEncoded = [];

/**
 * parses the json object retrieved from google api and constructs the desired json object for the view
 * it then renders the view
 * @param calendars
 */
function listCalendars(calendars) {
  if (calendars.length == 0 || calendars.items == null || calendars.items.length == 0) {
    res.render('calendars', {
      title: 'Invalid Token',
      body: 'Moonshine could not talk to Google Calendar with the given token'
    });
  } else {
    var simpleCalendar = [];
    for (var i = 0; i < calendars.items.length; i++) {
      var calendar = calendars.items[i];
      router.calendarIdEncoded[calendar.id] = urlencode(calendar.id);
      simpleCalendar[i] = {
        id: calendar.id,
        title: calendar.summary,
        color: calendar.colorId,
        writable: (calendar.accessRole == "owner") ||
        (calendar.accessRole == "writer"),
        selected: calendar.selected,
        timezone: calendar.timezone
      };
    }

    router.res.render('calendars', {
      title: 'Calendars List',
      calendars: simpleCalendar,
      token: router.token,
      calendarIds: router.calendarIdEncoded
    });
  }
}

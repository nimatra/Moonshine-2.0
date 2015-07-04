var express = require('express');
var https = require('https');
var urlencode = require('urlencode');
var calendar = require('./calendar');

var router = express.Router();
module.exports = router;

/**
 * Lists all the calendars user has
 * @param req
 * @param res
 */
router.listCalendars = function (req, res) {
  if (req.originalUrl.substr(0, '/calendars/'.length) == '/calendars/') {
    calendar.events(req, res);
    return;
  }
  router.token = req.query.accessToken;
  // options.path += getParams(token);

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
/**
 *
 * @param calendars
 */
function listCalendars(calendars) {
  if (calendars.length == 0) {
    console.log('No calendars found.');
  } else {
    console.log('Upcoming 10 events:');
    var simpleCalendar = [];
    for (var i = 0; i < calendars.items.length; i++) {
      var calendar = calendars.items[i];
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
      title: 'Calendar List',
      calendars: simpleCalendar,
      token: router.token,
      tab: '  '
    });
  }
}

var express = require('express');
var https = require('https');
var querystring = require('querystring');
var urlencode = require('urlencode');

var router = express.Router();

module.exports = router;

/* GET home page. */
router.events = function (req, res, next) {
  var index = 11;
  for(; index < req.originalUrl.length; index++){
    if(req.originalUrl[index] == '/') {
      break;
    }
  }
  if(index == req.originalUrl.length){
    throw "invalid parameters";
  }
  router.calendarId = req.originalUrl.substring(11,index);
  router.token = req.query.accessToken;

  var data = querystring.stringify({
    access_token: router.token
  });
  var options = {
    host: 'www.googleapis.com',
    path: '/calendar/v3/calendars/'+router.calendarId+'/events?'+data,
    method: 'GET',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  };
  var httpsRequest = https.request(options, calendarApiCallback);
  httpsRequest.end();
  router.res = res;
};
function calendarApiCallback(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    var calendar = JSON.parse(str);
    listEvents(calendar);
  });
}

function listEvents(calendar) {
  var simpleEvents = [];
  var events = calendar.items;
  if (events.length == 0) {
    router.res.render('events', {
      title: 'No upcoming events found.'
    });
  } else {
    for (var i = 0; i < events.length; i++) {
      var event = events[i];
      simpleEvents[i] = {
        id: event.id,
        status: event.status,
        title: event.summary,
        start: {
          dateTime: event.start.dateTime || event.start.date,
          timezone: calendar.timeZone
        },
        end: {
          dateTime: event.end.dateTime || event.end.date,
          timezone: calendar.timeZone
        },
        location: event.location,
        organizer: {
          name: event.organizer.displayName,
          emails: [
            event.organizer.email
          ],
          self: event.organizer.self
        },
        editable: (event.accessRole == "owner") ||
        (event.accessRole == "writer"),
        recurrence: event.recurrence
      };
      if (event.attendees != null) {
        var simpleAttendees = [];
        for (var j = 0; j < event.attendees.length; j++) {
          var attendee = attendees[j];
          simpleAttendees[j] = {
            name: attendee.displayName,
            emails: [
              attendee.email
            ],
            self: attendee.self,
            rsvpStatus: attendee.responseStatus
          };
        }
        simpleEvents[i].attendees = simpleAttendees;
      }
    }
    router.res.render('events', {
      title: calendar.summary,
      events: simpleEvents,
      tab: '  '
    });
  }
}

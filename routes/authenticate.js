var express = require('express');
var fs = require('fs');
var https = require('https');
var querystring = require('querystring');


var router = express.Router();
module.exports = router;


/**
 * Auth Callback - Redirects to the Calendar Page
 * @param req
 * @param res
 */
router.callback = function (req, res) {
    fs.readFile(__dirname + '/../client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        router.credentials = JSON.parse(content);
        router.code = req.query.code;
//        res.render('callback', {title: router.code});
        router.Exchange(res);
    });
};


/**
 * Authentication call
 * @param req
 * @param res
 */
router.authorize = function (req, res) {

// Load client secrets from a local file.

    fs.readFile(__dirname + '/../client_secret.json', function processClientSecrets(err, content) {
        if (err) {
            console.log('Error loading client secret file: ' + err);
            return;
        }
        // Authorize a client with the loaded credentials, then call the
        // Google Calendar API.
        router.credentials = JSON.parse(content);

        var authParams = querystring.stringify({
            redirect_uri: router.credentials.web.redirect_uris[0],
            response_type: 'code',
            client_id: router.credentials.web.client_id,
            scope: 'profile email https://www.googleapis.com/auth/calendar.readonly',
            approval_prompt: 'force'
        });
        var authBaseUrl = router.credentials.web.auth_uri;
        var url = authBaseUrl +'?'+ authParams.toString();
        res.redirect(url);

    });
};


router.Exchange = function (res) {

    // Authorize a client with the loaded credentials, then call the
    // Google Calendar API.

    var data = querystring.stringify({
        code: router.code,
        client_id: router.credentials.web.client_id.toString(),
        client_secret: router.credentials.web.client_secret.toString(),
        redirect_uri: router.credentials.web.redirect_uris[0],
        grant_type: 'authorization_code'
    });
    var options = {
        host: 'www.googleapis.com',
        path: '/oauth2/v3/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': data.length
        }
    };
    router.res = res;
    var httpPost = https.request(options, exchangeApiCallback);
    httpPost.write(data);
    httpPost.end();
};

/**
 *
 * @param response
 */
function exchangeApiCallback(response) {
    var str = '';

    //another chunk of data has been recieved, so append it to `str`
    response.on('data', function (chunk) {
        str += chunk;
    });

    //the whole response has been recieved, so we just print it out here
    response.on('end', function () {
        exchanges = JSON.parse(str);
        router.AccessToken = exchanges.access_token;
        router.res.redirect("../calendars?accessToken=" + router.AccessToken );
        // router.res.render('callback', {title: str});

    });
}

/**
 * Encodes the parameters to the URI friendly format
 * @return {string}
 */
function EncodeQueryData(data) {
    var ret = [];
    for (var d in data)
    {
        ret.push(data[d].key + "=" + encodeURIComponent(data[d].value));
    }
    return ret.join("&");
}
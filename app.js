'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const tokens = require('./tokens')
const app = express()

app.set('port', (process.env.PORT || 5000))


app.use(bodyParser.urlencoded({
    extended: false
}))


app.use(bodyParser.json())


app.get('/', function(req, res) {
    res.send('hello world i am a secret bot')
})


app.get('/webhook/', function(req, res) {
    if (req.query['hub.verify_token'] === tokens.WEBHOOK_TOKEN) {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
})


app.post('/webhook/', function(req, res) {
    let messaging_events = req.body.entry[0].messaging
    for (let i = 0; i < messaging_events.length; i++) {
        let event = req.body.entry[0].messaging[i]
        let sender = event.sender.id
        if (event.message && event.message.text) {
            let text = event.message.text

            if (text) {
                //movie details API
                const url = 'http://www.omdbapi.com/?t=' + text + '&y=&plot=short&r=json';
                request(url, function(err, res, body) {
                    try {
                        body = JSON.parse(body);
                        sendTextMessage(sender, body, err);
                    } catch (e) {
                        sendTextMessage(sender, body, e);
                    }

                })

            }
        }
    }
    res.sendStatus(200)
})


const token = tokens.PAGE_ACCESS_TOKEN;

function sendTextMessage(sender, text, err) {
    var messageData;
    if (err || text.Error) {
        messageData = {
            text: 'Sorry, no information about the movie could be found.'
        }
    } else {
        messageData = {
            attachment: {
                type: 'template',
                payload: {
                    template_type: 'generic',
                    elements: [{
                        title: text.Title,
                        image_url: text.Poster,
                        subtitle: text.Plot
                    }]
                }
            }
        }
    }

    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
            recipient: {
                id: sender
            },
            message: messageData
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

app.listen(app.get('port'), function() {
    console.log('running on port', app.get('port'))
})

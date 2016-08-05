'use strict'

const express = require('express')
const bodyParser = require('body-parser')
const request = require('request')
const app = express()

app.set('port', (process.env.PORT || 5000))


app.use(bodyParser.urlencoded({extended: false}))


app.use(bodyParser.json())


app.get('/', function (req, res) {
	res.send('hello world i am a secret bot')
})


app.get('/webhook/', function (req, res) {
	if (req.query['hub.verify_token'] === 'nchaugtalks-bot') {
		res.send(req.query['hub.challenge'])
	}
	res.send('Error, wrong token')
})


app.post('/webhook/', function (req, res) {
	let messaging_events = req.body.entry[0].messaging
	for (let i = 0; i < messaging_events.length; i++) {
		let event = req.body.entry[0].messaging[i]
		let sender = event.sender.id
		console.log(sender)
		if (event.message && event.message.text) {
			let text = event.message.text
			console.log(text)
			if (text === 'Generic') {
				sendGenericMessage(sender)
				continue
			}
			sendTextMessage(sender, "nchaugtalks: " + text.substring(0, 200))
		}
		if (event.postback) {
			let text = JSON.stringify(event.postback)
			sendTextMessage(sender, "received: "+text.substring(0, 200), token)
			continue
		}
	}
	res.sendStatus(200)
})


// recommended to inject access tokens as environmental variables, e.g.
// const token = process.env.PAGE_ACCESS_TOKEN
const token = "EAARZA5Am8Eh4BAET4ZCs9HxClN3G0LjOZBMxeCtyN4zcpDjctyJNSwLqJn0YWbSIIvvB8NsQpdj6fuf6qiKJZAOLNpSN4OFfdAH9xUbvuFYwfGZCMrs9264C5Lo4KRKavzO16T9ePWIgYzgwSdZCaQgBu3iXUzWn5YtegUVwi0VwZDZD"

function sendTextMessage(sender, text) {
	let messageData = { text:text }

	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
		}
	}, function(error, response, body) {
		if (error) {
			console.log('Error sending messages: ', error)
		} else if (response.body.error) {
			console.log('Error: ', response.body.error)
		}
	})
}

function sendGenericMessage(sender) {
	let messageData = {
		"attachment": {
			"type": "template",
			"payload": {
				"template_type": "generic",
				"elements": [{
					"title": "First card",
					"subtitle": "Element #1",
					"image_url": "http://vignette2.wikia.nocookie.net/clubpenguinpookie/images/7/77/Pikachu.png/revision/latest?cb=20140311111234",
					"buttons": [{
						"type": "web_url",
						"url": "https://www.messenger.com",
						"title": "web url"
					}, {
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for first element",
					}],
				}, {
					"title": "Second card",
					"subtitle": "Element #2",
					"image_url": "http://vignette2.wikia.nocookie.net/clubpenguinpookie/images/7/77/Pikachu.png/revision/latest?cb=20140311111234",
					"buttons": [{
						"type": "postback",
						"title": "Postback",
						"payload": "Payload for second ",
					}],
				}]
			}
		}
	}
	request({
		url: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {access_token:token},
		method: 'POST',
		json: {
			recipient: {id:sender},
			message: messageData,
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

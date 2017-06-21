'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const Price = require('./Price');

// create LINE SDK config from env variables
const config = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
    channelSecret: process.env.CHANNEL_SECRET,
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

function startLineApp() {
    //register a webhook handler with middleware
    //about the middleware, please refer to doc
    app.post('/webhook', line.middleware(config), (req, res) => {
        Promise
            .all(req.body.events.map(handleEvent))
            .then((result) => res.json(result));
    });

    // app.get('/test', (req, res) => {
    //     res.send(JSON.stringify(price.getPrice()));
    // })

    // app.get('/check', (req, res) => {
    //     var input = req.query.data;
    //     var out = price.checkPrice(input);
    //     console.log(out);
    //     // res.set('Content-Type', 'text/html');
    //     res.send(out);
    // })

    //listen on port
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`listening on ${port}`);
    });
}

// initial data
var price = new Price();
price.loadPrice(startLineApp);

// event handler
function handleEvent(event) {
    var messengToUser = '';

    if (event.type !== 'message' || event.message.type !== 'text' || event.message.type !== 'image') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }

    var reg = new RegExp("\\d{6}");
    if (reg.test(event.message.text)) {
        var data = price.checkPrice(reg.exec(event.message.text) + '');
        for (var i in data) {
            messengToUser += '💲 ' + data[i].text;
        }
        messengToUser = messengToUser.trim();
        if (!messengToUser.includes('false')) {
            messengToUser = '🏆 ยินดีด้วยคุณถูกรางวัล 🌟\n\n' + messengToUser;
        } else {
            messengToUser = '😭 เสียใจด้วยคุณไม่ถูกรางวัล 💔'
        }
        messengToUser += '\n\n' + '📆 ' + data[i].date;
    } else {
        messengToUser = '🎁 กรุณาส่งตัวเลข 6 หลัก หรือ ภาพถ่าย 🖼'
    }

    // create a echoing text message
    const packMessage = {
        type: 'text',
        text: messengToUser
    };
    // use reply API
    return client.replyMessage(event.replyToken, packMessage);
}
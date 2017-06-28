'use strict';

const line = require('@line/bot-sdk');
const express = require('express');

const Price = require('./price');

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

// load data every 1 hour
setInterval(function () {
    price.loadPrice(startLineApp);
    console.log("Loop load date.");
}, 3600000);

// event handler
function handleEvent(event) {
    var messengToUser = '';
    var reg = new RegExp("\\d{6}");
    var reg2to3 = new RegExp("\\d{2,3}");

    if (event.type !== 'message' || event.message.type !== 'text') {
        // ignore non-text-message event
        return Promise.resolve(null);
    }
    if (event.message.type == 'text' && event.message.text == '?') {
        messengToUser = `📑 วิธีการใช้งาน 💬
        ❌ ส่งเลข 6 หลัก เพื่อตรวจรางวัล
        ⭕ ส่งคำว่า "หวย" เพื่อดูรางวัลงวดล่าสุด
        ❌ ส่งคำว่า "ขอ 2","ขอ 3" เพื่อขอเลขจาก LottoMan
        ⭕ ส่งคำว่า "[เลข 2 หรือ 3 ตัวตามด้วย]?" เพื่อเช็คเลขนี้เด็ดใหม`;
    } else if (event.message.type == 'text' && event.message.text.includes('?') && event.message.text.length < 5) {
        var num2to3 = reg2to3.exec(event.message.text) + '';
        var currentDate = new Date();
        var total = parseInt(num2to3) + parseInt(currentDate.getMonth());
        if (total % 2) {
            messengToUser = num2to3 + ' เลขนี้เด็ดมาก 👍';
        } else {
            messengToUser = num2to3 + ' เลขไม่เด็ดเลย 👎';
        }
    } else if (event.message.type == 'text' && event.message.text == 'หวย') {
        var allPrice = price.getPrice();
        messengToUser += '📆 ' + allPrice.date.replace('ตรวจหวย', 'งวดวันที่') + '\n\n';
        messengToUser += '🏆 ' + allPrice['price1'].name + ' : ' + allPrice['price1'].data + '\n';
        messengToUser += '🎖 ' + allPrice['pricel2'].name + ' : ' + allPrice['pricel2'].data + '\n';
        messengToUser += '💸 ' + allPrice['pricef3'].name + ' : ' + allPrice['pricef3'].data.toString() + '\n';
        messengToUser += '💸 ' + allPrice['pricel3'].name + ' : ' + allPrice['pricel3'].data.toString() + '\n';
        messengToUser += '🎆 ' + allPrice['pricen1'].name.replace('รางวัลที่ 1', '') + ' : ' + allPrice['pricen1'].data.toString();
    } else if (event.message.type == 'text' && reg.test(event.message.text)) {
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
    } else if (event.message.type == 'text' && (event.message.text.includes('ขอ 2') || event.message.text.includes('ขอ 3'))) {
        if (event.message.text.includes('2')) {
            messengToUser = '2️⃣ เลขที่ได้คือ ' + Math.floor((Math.random() * 100) + 1) + ' ขอให้โชคดี 🙋‍♂️';
        } else {
            messengToUser = '3️⃣ เลขที่ได้คือ ' + Math.floor((Math.random() * 1000) + 1) + ' ขอให้โชคดี 🙋';
        }
    } else {
        messengToUser = '🎁 กรุณาส่งเลข 6 หลัก , ส่ง "หวย" หรือ "?" 🖼'
    }

    // create a messeng to user text message
    const packMessage = {
        type: 'text',
        text: messengToUser
    };
    // use reply API
    return client.replyMessage(event.replyToken, packMessage);
}
'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const http = require("http");

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

//Prevent Your Heroku Node App From Sleeping
setInterval(function () {
    http.get("http://lottoman.herokuapp.com", function (request) {
        console.log("Prevent App From Sleeping.")
    });
}, 900000); // every 15 minutes (300000)

// initial data
var price = new Price();
price.loadPrice(startLineApp);

// load data every 30 minutes
setInterval(function () {
    price.loadPrice(function () {
        console.log("Load latest data.")
    });
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
        messengToUser = `📑 วิธีการใช้งาน 💬\n
❌ ส่งเลข 6 หลัก เพื่อตรวจรางวัล
⭕ ส่งคำว่า "หวย" เพื่อดูรางวัลงวดล่าสุด
❌ ส่งคำว่า "ขอ 2" , "ขอ 3" เพื่อขอเลข
⭕ ส่งคำว่า "[เลข 2-3 หลัก]ต่อด้วย"?" เพื่อเช็คเลขเด็ด;
❌ ส่งคำว่า "สด" เพื่อขอ Live การออกรางวัล
⭕ ส่งคำว่า "เรียงเบอร์" เพื่อขอใบตรวจรางวัล`;
    } else if (event.message.type == 'text' && event.message.text.includes('?') && event.message.text.length < 5 && event.message.text.length > 2) {
        var num2to3 = reg2to3.exec(event.message.text) + '';
        var currentDate = new Date();
        if (num2to3.includes(currentDate.getMonth() % 10)) {
            messengToUser = num2to3 + ' เลขนี้เด็ด 👍';
        } else {
            messengToUser = num2to3 + ' เลขไม่เด็ดเลย 👎';
        }
    } else if (event.message.type == 'text' && event.message.text == 'สด') {
        var ListAndLive = price.getListAndLive();
        messengToUser += '📺 Live การออกสลากกินแบ่งรัฐบาล\n\n';
        messengToUser += '👇 คลิกเลย >>> ' + ListAndLive.lottoLive + ' <<< 👍';
    } else if (event.message.type == 'text' && event.message.text == 'เรียงเบอร์') {
        var ListAndLive = price.getListAndLive();
        messengToUser += '📜 ใบตรวจรางวัลงวดล่าสุด\n\n';
        messengToUser += '👇 คลิกเลย >>> ' + ListAndLive.lottoList + ' <<< 👍';
    } else if (event.message.type == 'text' && event.message.text == 'หวย') {
        var allPrice = price.getPrice();
        if (allPrice['price1'].data == '') {
            messengToUser += '📆 ' + allPrice.date.replace('ตรวจหวย', 'งวดวันที่') + '\n\n';
            messengToUser += '⏳ อยู่ในช่วงรอประกาศผล 📢';
        } else {
            messengToUser += '📆 ' + allPrice.date.replace('ตรวจหวย', 'งวดวันที่') + '\n\n';
            messengToUser += '🏆 ' + allPrice['price1'].name + ' : ' + allPrice['price1'].data + '\n';
            messengToUser += '🎖 ' + allPrice['pricel2'].name + ' : ' + allPrice['pricel2'].data + '\n';
            messengToUser += '💸 ' + allPrice['pricef3'].name + ' : ' + allPrice['pricef3'].data.toString() + '\n';
            messengToUser += '💸 ' + allPrice['pricel3'].name + ' : ' + allPrice['pricel3'].data.toString() + '\n';
            messengToUser += '🎆 ' + allPrice['pricen1'].name.replace('รางวัลที่ 1', '') + ' : ' + allPrice['pricen1'].data.toString();
        }
    } else if (event.message.type == 'text' && reg.test(event.message.text) && event.message.text.length == 6) {
        var allPrice = price.getPrice();
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
        if (allPrice['price1'].data == '') {
            messengToUser += '\n⏳ อยู่ในช่วงรอประกาศผล 📢';
        }
    } else if (event.message.type == 'text' && (event.message.text.includes('ขอ 2') || event.message.text.includes('ขอ 3'))) {
        var hash = price.hashCode() + '';
        if (event.message.text.includes('2')) {
            messengToUser = '🎉 ️เลขที่ได้คือ ' + hash.substring(0, 2) + ' 🎆\n\n🌈 ขอให้โชคดี 🙋‍️';
        } else {
            messengToUser = '🎉 ️เลขที่ได้คือ ' + hash.substring(hash.length - 3, hash.length) + ' 🎆\n\n🌈 ขอให้โชคดี 🙋';
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
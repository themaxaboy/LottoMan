const cheerio = require("cheerio");
const request = require('request-promise');

const Price = function () {
    /******************************************************/
    var date = "";
    var price1 = {
        data: "",
        name: "รางวัลที่ 1",
        value: 3000000,
        type: "n"
    };
    var pricel2 = {
        data: "",
        name: "รางวัลเลขท้าย 2 ตัว",
        value: 1000,
        type: "2"
    };
    var pricef3 = {
        data: "",
        name: "รางวัลเลขหน้า 3 ตัว",
        value: 2000,
        type: "f3"
    };
    var pricel3 = {
        data: "",
        name: "รางวัลเลขท้าย 3 ตัว",
        value: 2000,
        type: "l3"
    };
    var pricen1 = {
        data: "",
        name: "รางวัลข้างเคียงรางวัลที่ 1",
        value: 50000,
        type: "n"
    };

    var price2 = {
        data: "",
        name: "รางวัลที่ 2",
        value: 100000,
        type: "n"
    };
    var price3 = {
        data: "",
        name: "รางวัลที่ 3",
        value: 40000,
        type: "n"
    };
    var price4 = {
        data: "",
        name: "รางวัลที่ 4",
        value: 20000,
        type: "n"
    };
    var price5 = {
        data: "",
        name: "รางวัลที่ 5",
        value: 10000,
        type: "n"
    };
    this.price = {
        date: date,
        price1: price1,
        pricel2: pricel2,
        pricef3: pricef3,
        pricel3: pricel3,
        pricen1: pricen1,
        price2: price2,
        price3: price3,
        price4: price4,
        price5: price5,
    };
}

Price.prototype.loadPrice = function (callback) {
    const options = {
        uri: process.env.API_SITE,
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    var me = this;
    request(options).then(function ($) {
        $(".clearfix > div > div > h2 > a > span").each(function () {
            var link = $(this);
            me.price.date = '';
            me.price.date = link.text().replace("ตรวจหวย", "งวดวันที่");
            //console.log(me.price.date);
        });

        $(".prize-1 > div > div > span").each(function () {
            var link = $(this);
            me.price['price1'].data = '';
            me.price['price1'].data = link.text().split(" ");
        });

        $(".prize-l2 > div > div > span").each(function () {
            var link = $(this);
            me.price['pricel2'].data = '';
            me.price['pricel2'].data = link.text().split(" ");
        });

        $(".prize-f3 > div > span > span").each(function () {
            var link = $(this);
            me.price['pricef3'].data = [];
            me.price['pricef3'].data = link.text().split(" ");
        });

        $(".prize-l3 > div > span > span").each(function () {
            var link = $(this);
            me.price['pricel3'].data = [];
            me.price['pricel3'].data = link.text().split(" ");
        });

        $(".prize-n1 > div > span > span").each(function () {
            var link = $(this);
            me.price['pricen1'].data = [];
            me.price['pricen1'].data = link.text().split(" ");
        });
        /*******************************************************/
        $(".prize-2 > div").each(function () {
            var link = $(this);
            me.price['price2'].data = [];
            me.price['price2'].data = link.text();
            me.price['price2'].data = me.price['price2'].data.split('\t').join('').split('\n').join(' ').split(" ");
            me.price['price2'].data.shift();
            me.price['price2'].data.pop()
        });

        $(".prize-3 > div").each(function () {
            var link = $(this);
            me.price['price3'].data = [];
            me.price['price3'].data = link.text();
            me.price['price3'].data = me.price['price3'].data.split('\t').join('').split('\n').join(' ').split(" ");
            me.price['price3'].data.shift();
            me.price['price3'].data.pop();
        });

        $(".prize-4 > div").each(function () {
            var link = $(this);
            me.price['price4'].data = [];
            me.price['price4'].data = link.text();
            me.price['price4'].data = me.price['price4'].data.split('\t').join('').split('\n').join(' ').split(" ");
            me.price['price4'].data.shift();
            me.price['price4'].data.pop();
        });

        $(".prize-5 > div").each(function () {
            var link = $(this);
            me.price['price5'].data = [];
            me.price['price5'].data = link.text();
            me.price['price5'].data = me.price['price5'].data.split('\t').join('').split('\n').join(' ').split(" ");
            me.price['price5'].data.shift();
            me.price['price5'].data.pop();
        });
        /*******************************************************/
        callback(me.price);
    });
}

Price.prototype.getPrice = function () {
    return this.price;
}

Price.prototype.hashCode = function () {
    var hash = 0;
    if (this.price.date.length == 0) return hash;
    for (i = 0; i < this.price.date.length; i++) {
        char = this.price.date.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

Price.prototype.checkPrice = function (input) {
    var f3 = input.substring(0, 3);
    var l3 = input.substring(3, 6);
    var l2 = input.substring(4, 6);
    var isCheck = false,
        data = [];

    for (var key in this.price) {
        if (this.price[key].type == 'n' && this.price[key].data.indexOf(input) >= 0) {
            data.push({
                text: this.price[key].name + ' มูลค่า ' + numberWithCommas(this.price[key].value) + '\n',
                date: this.price.date
            });
            isCheck = true;
        }
    }
    if (this.price['pricef3'].data.indexOf(f3) >= 0) {
        data.push({
            text: this.price['pricef3'].name + ' มูลค่า ' + numberWithCommas(this.price['pricef3'].value) + '\n',
            date: this.price.date
        });
        isCheck = true;
    }
    if (this.price['pricel3'].data.indexOf(l3) >= 0) {
        data.push({
            text: this.price['pricel3'].name + ' มูลค่า ' + numberWithCommas(this.price['pricel3'].value) + '\n',
            date: this.price.date
        });
        isCheck = true;
    }
    if (this.price['pricel2'].data.indexOf(l2) >= 0) {
        data.push({
            text: this.price['pricel2'].name + ' มูลค่า ' + numberWithCommas(this.price['pricel2'].value) + '\n',
            date: this.price.date
        });
        isCheck = true;
    }
    if (!isCheck) {
        data.push({
            text: isCheck,
            date: this.price.date
        });
    }
    return data;
}

Price.prototype.getList = function (callback) {
    const options = {
        uri: 'http://www.glo.or.th/home.php',
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    request(options).then(function ($) {
        $("a").each(function () {
            var link = $(this);
            var href = link.attr("href");

            if (href.includes('.pdf')) {
                return 'http://www.glo.or.th' + href;
            }
        });
        callback();
    });
}

Price.prototype.getLive = function (callback) {
    const options = {
        uri: 'http://www.glo.or.th/home.php',
        transform: function (body) {
            return cheerio.load(body);
        }
    };
    request(options).then(function ($) {
        $("a").each(function () {
            var link = $(this);
            var href = link.attr("href");

            if (href.includes('youtube.com')) {
                return href;
            }
        });
        callback();
    });
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

module.exports = Price;
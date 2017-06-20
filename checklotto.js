var request = require("request");
var cheerio = require("cheerio");

/******************************************************/
var price1 = {
  data: "",
  name: "รางวัลที่ 1",
  value: 3000000,
  type: "n"
};
var pricel2 = {
  data: "",
  name: "เลขท้าย 2 ตัว",
  value: 1000,
  type: "2"
};
var pricef3 = {
  data: "",
  name: "เลขหน้า 3 ตัว",
  value: 2000,
  type: "f3"
};
var pricel3 = {
  data: "",
  name: "เลขท้าย 3 ตัว",
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

/******************************************************/

var fetchData = new Promise(
  function (resolve, reject) {
    request({
      uri: "<API>",
    }, function (error, response, body) {
      var $ = cheerio.load(body);

      $(".prize-1 > div > div > span").each(function () {
        var link = $(this);
        price1.data = link.text().split(" ");
        //console.log(price1.data);
      });

      $(".prize-l2 > div > div > span").each(function () {
        var link = $(this);
        pricel2.data = link.text().split(" ");
        //console.log(pricel2.data);
      });

      $(".prize-f3 > div > span > span").each(function () {
        var link = $(this);
        pricef3.data = link.text().split(" ");
        //console.log(prizef3.data);
      });

      $(".prize-l3 > div > span > span").each(function () {
        var link = $(this);
        pricel3.data = link.text().split(" ");
        //console.log(prizel3.data);
      });

      $(".prize-n1 > div > span > span").each(function () {
        var link = $(this);
        pricen1.data = link.text().split(" ");
        //console.log(prizen1.data);
      });
      /*******************************************************/
      $(".prize-2 > div").each(function () {
        var link = $(this);
        price2.data = link.text();
        price2.data = price2.data.split('\t').join('').split('\n').join(' ').split(" ");
        //console.log(price2.data);
        //console.log(prizen2.data);
      });

      $(".prize-3 > div").each(function () {
        var link = $(this);
        price3.data = link.text();
        price3.data = price3.data.split('\t').join('').split('\n').join(' ').split(" ");
        //console.log(prizen3.data);
      });

      $(".prize-4 > div").each(function () {
        var link = $(this);
        price4.data = link.text();
        price4.data = price4.data.split('\t').join('').split('\n').join(' ').split(" ");
        //console.log(prizen4.data);
      });

      $(".prize-5 > div").each(function () {
        var link = $(this);
        price5.data = link.text();
        price5.data = price5.data.split('\t').join('').split('\n').join(' ').split(" ");
        //console.log(prizen5.data);
      });
      /*******************************************************/
      if (price5.data != "") {
        resolve();
      } else {
        var error = new Error("API didn't work");
        reject(error.message);
      }
    });
  }
);

// call our promise
var checkLotto = function (number) {
  fetchData
    .then(function (fulfilled) {
      //console.log(fulfilled);
      var allPriceLotto = [price1, pricen1, price2, price3, price4, price5];
      var allResult = [];

      allPriceLotto.forEach(function (entry) {
        var result = compareNumber(entry, number);
        if (result != "")
          allResult.push(result);
      });

      if (allResult == "") {
        console.log("เสียใจด้วยคุณไม่ถูกรางวัล");
      } else {
        while (allResult.length) {
          console.log(allResult.pop());
        }
      }
    })
    .catch(function (error) {
      console.log(error.message);
    });
}

function compareNumber(lotto, number) {
  var stringOut = "";
  /*if (lotto.type == "2"){

  }
  else if (lotto.type == "3f"){

  }
  else if (lotto.type == "3l"){

  }
  else */
  if (lotto.data.indexOf(number) != -1) {
    stringOut += "ยินดีด้วยคุณถูก" + lotto.name + " มูลค่า " + numberWithCommas(lotto.value);
  } else {
    stringOut = "";
  }
  return stringOut;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

checkLotto("964747");

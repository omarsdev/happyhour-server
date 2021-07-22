const schedule = require("node-schedule");
const asyncHandler = require("./async");
const { ads } = require("../model/Ads");
const Ads = require("../model/Ads");
var moment = require('moment-timezone');

var jsonData = require("tzdata");

exports.getAds = asyncHandler(async (req, res, next) => {
  const rule = new schedule.RecurrenceRule();
  rule.minute = 0;
  //   rule.second = [0, 15, 30, 45, 60];
  rule.tz = "Etc/GMT+2";

  schedule.scheduleJob(rule, async function () {
    const ads = await Ads.find();
    // console.log(ads.start_time)
    for (let i = 0; i < ads.length; i++) {
      // console.log(ads[i].start_time.getUTCHours(), ads[i].start_time.getUTCMinutes(), ads[i].start_time.getUTCSeconds())
      // console.log(ads[i].start_time.getHours(), ads[i].start_time.getMinutes(), ads[i].start_time.getSeconds())
      if (ads[i].start_time.getHours() === new Date().getHours()) {
        console.log("ads Is Started".green.underline.bold);
        await Ads.findByIdAndUpdate(ads[i]._id, {
          role: "start",
        });
      } else if (ads[i].end_time.getHours() === new Date().getHours()) {
        console.log("ads Is Ended".red.bold);
        await Ads.findByIdAndUpdate(ads[i]._id, {
          role: "end",
        });
      }
    }
  });
});

// var d = new Date("2021-03-18T08:43:03.358Z"); /* midnight in China on April 13th */
// d.toLocaleString('ar-SA', { timeZone: 'Asia/Damascus' });
// console.log(d)

// console.log(jsonData.zones["Asia/Damascus"])
// console.log(jsonData.rules.Syria)

// console.log(new Date().getTime() / 1000)

// let date = new Date(Date.UTC("2021-03-18T08:43:03.358Z"));

// console.log("Given IST datetime: " + date);

// let intlDateObj = new Intl.DateTimeFormat("en-US", {
//   timeZone: "America/New_York",
// });

// var june = moment("2021-03-18T08:43:03.358Z");
// var dd = june.tz('Asia/Damascus').format('ha z')
// console.log(dd.blue)

// var syria = moment.tz("2021-03-18T08:43:03.358Z", "Asia/Damascus")
// console.log("DAMASCUS", syria.format());

// var Egypy = moment.tz("2021-03-18T08:43:03.358Z", "Africa/Cairo")
// console.log("Egypy", Egypy.format());

// var Riyadh = moment.tz("2021-03-18T08:43:03.358Z", "Asia/Riyadh")
// console.log("Riyadh", Riyadh.format());

// console.log(new Date())
// const date = new Date("2021-03-18T12:33:27.618Z")
// console.log(moment.utc())





// 2// convert local time to UTC time
// function convertLocalToUTC(dt) {
//   return moment(dt).utc().format();
// }
// // Current local date to UTC date:
// convertLocalToUTC(moment()); // Output: 2020-05-20 12:41:47 PM
 
// // Local date "2020-05-20 10:12:44 PM" to UTC date:
// console.log(convertLocalToUTC('2021-03-18T12:33:27.618Z')); // Output: 2020-05-20 04:42:44 PM


// var a = moment.tz("2021-03-18T12:33:27.618Z" ,"Asia/Damascus");
// var s = moment.tz("2021-03-18T01:13:27.618Z", "utc").utc().format()
// console.log(s)

// a.format(); // 2013-11-18T19:55:00+08:0
// const date = a.utc().format()
// console.log(date); // 2013-11-18T11:55Z

// let usaTime = intlDateObj.format(date);
// console.log("USA date: " + usaTime);

// const getAllAdsforTimeNow = async () => {
//     const ads = await Ads.find()
//     // console.log(ads.start_time)
//     for (let i = 0; i < ads.length; i++) {
//         // console.log(ads[i].start_time.getUTCHours(), ads[i].start_time.getUTCMinutes(), ads[i].start_time.getUTCSeconds())
//         // console.log(ads[i].start_time.getHours(), ads[i].start_time.getMinutes(), ads[i].start_time.getSeconds())
//         if(ads[i].start_time.getHours() === new Date().getHours()){
//             console.log("Hello World")
//             await Ads.findByIdAndUpdate(ads[i]._id, {
//                 role: "start",
//             })
//         }
//         else if(ads[i].end_time.getHours() === new Date().getHours()){
//             console.log("Hello World")
//             await Ads.findByIdAndUpdate(ads[i]._id, {
//                 role: "start",
//             })
//         }
//     }
//     // function formatAMPM(date) {
//     //     var hours = date.getHours();
//     //     var minutes = date.getMinutes();
//     //     var ampm = hours >= 12 ? 'pm' : 'am';
//     //     hours = hours % 12;
//     //     hours = hours ? hours : 12; // the hour '0' should be '12'
//     //     minutes = minutes < 10 ? '0'+minutes : minutes;
//     //     var strTime = hours + ':' + minutes + ' ' + ampm;
//     //     return strTime;
//     //   }

//     //   console.log(formatAMPM(new Date));
// }

// console.log(new Date())
// getAllAdsforTimeNow()

// var dt = new Date();
// dt.setHours( dt.getHours() + 2 );
// console.log(dt)

const express = require("express");
const admin = require("firebase-admin");

const router = express.Router();
const serviceAccount = require("../config/firebase.json");
const User = require("../model/User");

const { sendNotification } = require("../utils/sendNotification");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });
let tokens = [,];
// console.log(tokens);
// router.post("/post", (req, res) => {
//   tokens.push(req.body.token);
//   res.status(200).json({ message: "Successfully registered FCM Token!" });
// });

// router.route("/register").post((req, res) => {
//   tokens.push(req.body.token);
//   console.log(tokens);

//   res.status(200).json({ message: "Successfully registered FCM Token!" });
// });

router.route("/notifications").post(async (req, res) => {
  try {
    const { title, body, imageUrl } = req.body;
    // const user = await User.findOne({ phone_number: "0958744947" }).select(
    //   "notificationToken"
    // );
    // // tokens.push(user.notificationToken[0]);

    // user.notificationToken.forEach((element) => {
    //   if (element) {
    //     tokens.push(element);
    //   }
    // });
    // console.log(tokens);
    const isSend = await sendNotification(
      [
        "c3P84stcSgCGO0NcxdQ18Q:APA91bEYhTV_wecqy7CddD6HAJUiuyT9QNq__DJeBYcPOzeq9lebnROEtFLe_BxiqXvluc6Cd-drYFPeSP-4dd-c89wNclaOPC-TA3uoKjz4dDU0tlU2ONbJLlwCaYfBmywAh5_wBqEe",
      ],
      title,
      body,
      imageUrl
    );
    if (isSend) {
      res.json({
        success: true,
      });
    } else {
      res.json({
        success: false,
      });
    }
  } catch (error) {
    console.log(error);
  }
  //     await admin.messaging().sendMulticast({
  //       tokens,
  //       notification: {
  //         title,
  //         body,
  //         imageUrl,
  //       },
  //     });
  //     res.status(200).json({ message: "Successfully sent notifications!" });
  //   } catch (err) {
  //     res
  //       .status(err.status || 500)
  //       .json({ message: err.message || "Something went wrong!" });
  //   }
});

// router.post("/notifications", async (req, res) => {
//   try {
//     const { title, body, imageUrl } = req.body;
//     await admin.messaging().sendMulticast({
//       tokens,
//       notification: {
//         title,
//         body,
//         imageUrl,
//       },
//     });
//     res.status(200).json({ message: "Successfully sent notifications!" });
//   } catch (err) {
//     res
//       .status(err.status || 500)
//       .json({ message: err.message || "Something went wrong!" });
//   }
// });

module.exports = router;

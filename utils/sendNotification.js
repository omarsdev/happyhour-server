const express = require("express");
const admin = require("firebase-admin");

const serviceAccount = require("../config/firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

exports.sendNotification = async (tokens, title, body, imageUrl) => {
  try {
    await admin.messaging().sendMulticast({
      tokens,
      notification: {
        title,
        body,
        imageUrl,
        // priority: "high",
      },
    });
    // res.status(200).json({ message: "Successfully sent notifications!" });
    return true;
  } catch (err) {
    // res
    //   .status(err.status || 500)
    console.log(err);
    //   .json({ message: err.message || "Something went wrong!" });
    return false;
  }
};

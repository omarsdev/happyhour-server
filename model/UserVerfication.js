const mongoose = require("mongoose");

const UserVerficationSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  ads_user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Verfication",
    },
  ],
  store_user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VerficationStore",
    },
  ],
  gift_user: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VerficationGift",
    },
  ],
});

module.exports = mongoose.model("UserVerfication", UserVerficationSchema);

const mongoose = require("mongoose");

const UserBrandPointsSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  brand_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  points: {
    type: Number,
    default: 0,
  },
  cards: {
    type: Number,
    default: 0,
  },
  logs: [
    {
      desc: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
});

module.exports = mongoose.model("UBPoints", UserBrandPointsSchema);

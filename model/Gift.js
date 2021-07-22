const mongoose = require("mongoose");

const GiftSchema = new mongoose.Schema({
  verficationCode: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VerficationGift",
    },
  ],
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  model_number: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price_in_points: {
    type: Number,
    required: true,
  },
  price_on_card: {
    type: Number,
    required: true,
  },
  photo: {
    type: String,
  },
  // user_gift: [
  //   {
  //     userid: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "user",
  //     },
  //     createdAt: {
  //       type: Date,
  //       default: Date.now,
  //     },
  //     is_taken: {
  //       type: Boolean,
  //       default: false,
  //     },
  //     takenAt: {
  //       type: Date,
  //       default: Date.now,
  //     },
  //   },
  // ],
  quantity: {
    type: Number,
    required: true,
  },
  out_of_stack: {
    type: Boolean,
    default: false,
  },
  giftTeamplate: {
    type: String,
    enum: ["TeamplateA", "TeamplateB"],
    required: true,
  },
  destroyCodeTimer: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Gift", GiftSchema);

const mongoose = require("mongoose");

//Ads Schema
const AdsSchema = new mongoose.Schema({
  verficationCode: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Verfication",
    },
  ],
  happy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  views: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  // happyCount: {
  //   type: Number,
  // },
  description: {
    type: [
      {
        type: String,
        required: [true, "Please Add A Description for you product"],
        maxLength: 150,
      },
    ],
    validate: [arrayLimit, "max size is 5"],
  },
  ads_type: {
    type: String,
    enum: ["Gift", "Offer", "Discount"],
  },
  start_time: {
    type: Date,
    required: true,
  },
  end_time: {
    type: Date,
    required: true,
  },
  numberofhour: {
    type: Number,
    required: true,
  },
  discount: {
    type: [
      {
        type: Number,
        max: 99,
        min: 1,
      },
    ],
    validate: [arrayLimit, "max discount is 5"],
  },

  photo: {
    type: [
      {
        type: String,
        default: "no-photo.jpg",
      },
    ],
    validate: [arrayLimit, "max size is 5"],
  },
  brand: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    enum: ["start", "end", "hold"],
    default: "hold",
  },
  ads_teamplate: {
    type: String,
    enum: ["teamplateA", "teamplateB", "teamplateTeaser"],
    required: true,
  },
  price_on_card: {
    type: Number,
    required: true,
  },
  price_in_points: {
    type: Number,
    required: true,
  },
  adsPointHappyHour: {
    type: Number,
    required: true,
    default: 10,
  },
});

function arrayLimit(val) {
  return val.length <= 5;
}

// AdsSchema.pre("validate", function (next) {
//   this.happyCount = this.happyCount.length();
//   next();
// });

module.exports = mongoose.model("Ads", AdsSchema);

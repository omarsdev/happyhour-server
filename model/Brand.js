const mongoose = require("mongoose");

//Brand Schema
const BrandSchema = new mongoose.Schema({
  name_en: {
    type: String,
    required: true,
  },
  name_ar: {
    type: String,
    required: true,
  },
  date_created_company: {
    type: Date,
  },
  social_media: [
    {
      type: String,
    },
  ],
  branche: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branche",
    },
  ],
  logo: {
    type: String,
    default: "no-photo.jpg",
  },
  cover: {
    type: String,
    default: "no-photo.jpg",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  interestedUser: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  ads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ads",
    },
  ],
  gift: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gift",
    },
  ],
  paymentAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PaymentAccount",
  },
  clientid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
    // required: true
  },
  categoryid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  storeid: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },
  ],
  // rateuser: [
  //   {
  //     _id: {
  //       type: mongoose.Schema.Types.ObjectId,
  //       ref: "User",
  //     },
  //     rate: {
  //       type: Number,
  //     },
  //   },
  // ],
  Rate: [
    {
      user_ref: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      comment: {
        type: String,
        maxlength: 250,
        required: true,
      },
      rate: {
        type: Number,
        required: true,
      },
      created_at: {
        type: Date,
        default: Date.now(),
      },
    },
  ],
  rateAvg: {
    type: Number,
    default: 0,
  },
});

const BrancheSchema = new mongoose.Schema({
  name_en: {
    type: String,
  },
  name_ar: {
    type: String,
  },
  address: {
    type: String,
  },
  city: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
  },
  street: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Street",
  },
  brand_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
  },
  casher: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  managerAdmin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  telephone_number: {
    type: String,
    maxLength: 10,
  },
});

const Brand = mongoose.model("Brand", BrandSchema);
const Branche = mongoose.model("Branche", BrancheSchema);
module.exports = { Brand, Branche };

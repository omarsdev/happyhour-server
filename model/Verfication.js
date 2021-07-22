const mongoose = require("mongoose");

const VerficationAdsSchema = new mongoose.Schema({
  ads_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ads",
    required: true,
  },
  user_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brand_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expire: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used_at: {
    type: Date,
  },
});
const VerficationAds = mongoose.model("Verfication", VerficationAdsSchema);

const VerficationStoreSchema = new mongoose.Schema({
  store_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  user_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  brand_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expire: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used_at: {
    type: Date,
  },
});

const VerficationStore = mongoose.model(
  "VerficationStore",
  VerficationStoreSchema
);

const VerficationGiftSchema = new mongoose.Schema({
  gift_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gift",
    required: true,
  },
  user_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  brand_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brand",
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  expire: {
    type: Boolean,
    default: false,
  },
  quantity: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  used_at: {
    type: Date,
  },
});

const VerficationGift = mongoose.model(
  "VerficationGift",
  VerficationGiftSchema
);

module.exports = {
  VerficationAds,
  VerficationGift,
  VerficationStore,
};

const mongoose = require("mongoose");

const CasherSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  brandId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Brnad",
  },
  branchId: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Branche",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  ads_log: [{
    msg: {
        type: String,
    },
    code: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    _id: false
  }],
  gift_log: [{
      msg: {
          type: String
      },
      code: {
          type: String
      },
      createdAt: {
          type: Date,
          default: Date.now
      },
      _id: false
  }],
  store_log: [{
      msg: {
          type: String
      },
      code: {
          type: String
      },
      createdAt: {
          type: Date,
          default: Date.now
      },
      _id: false
  }]
});

module.exports = mongoose.model("Casher", CasherSchema);

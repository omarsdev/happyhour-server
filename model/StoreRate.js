const mongoose = require("mongoose");

const StoreRateSchema = new mongoose.Schema({
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
  },
  rate: {
    type: Number,
  },
});

//Call Average After Save
StoreRateSchema.statics.getAverageRate = async function (storeId) {
  // console.log("Caculating avg Cost ...".blue);

  const obj = await this.aggregate([
    {
      $match: { store: storeId },
    },
    {
      $group: {
        _id: "$store",
        averageCost: { $avg: "$rate" },
      },
    },
  ]);

  // console.log(obj);
};

//cal averrate before save
StoreRateSchema.post("save", function () {
  this.constructor.getAverageRate(this.store);
});

//cal average rate before remove

module.exports = mongoose.model("StoreRate", StoreRateSchema);

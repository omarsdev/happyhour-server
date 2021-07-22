const mongoose = require("mongoose");
const HappyPackegeSchema = new mongoose.Schema({
  numberOfHour: {
    type: Number,
    require: [true, "Please add number of hour"],
  },
  totalPrice: {
    type: Number,
    require: [true, "Please add Total Price for each Hour"],
  },
});

const HappyPackege = mongoose.model("HappyPackege", HappyPackegeSchema)

const AdsPackegeSchema = new mongoose.Schema({
    adsDiscount: {
        type: Array,
        require: true,
    },
    totalDiscount: {
        type: Number,
        require: true,
    }
});

const AdsPackege = mongoose.model("AdsPackege", AdsPackegeSchema)

module.exports = {
    HappyPackege,
    AdsPackege
}
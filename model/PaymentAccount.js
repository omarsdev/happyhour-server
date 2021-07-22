const mongoose = require("mongoose");

const PaymentAccountSchema = new mongoose.Schema({
  hourLeft: {
    type: Number,
  },
  balance: {
    type: Number,
  },
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Client",
  },
  payment: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Payment"
  }],
});

// const RecordHistory = new mongoose.Schema({
//   typeOfRecord: {
//     type: String,
//     enum: ["recive", "outgoing"]
//   },
// })


module.exports = mongoose.model("PaymentAccount", PaymentAccountSchema);
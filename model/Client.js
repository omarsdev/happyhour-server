const mongoose = require("mongoose");

//Client Schema
const clientSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  telephone_number: [
    {
      type: String,
      maxLength: [20, "Unvalid Phone Number"],
    },
  ],
  email: [
    {
      type: String,
      maxLength: 40,
    },
  ],

  brand: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
    },
  ],
  ads_log: [
    {
      msg: {
        type: String,
      },
      code: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
  gift_log: [
    {
      msg: {
        type: String,
      },
      code: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
  store_log: [
    {
      msg: {
        type: String,
      },
      code: {
        type: String,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      _id: false,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // paymentAccount: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "PaymentAccount",
  // },
});
const Client = mongoose.model("Client", clientSchema);

//Payment Schema
const PaymentSchema = new mongoose.Schema({
  amount_received: {
    type: Number,
    required: [true, "Add Amount of Number"],
  },
  payment_number: {
    type: Number,
    required: true,
  },
  date_of_payment: {
    type: Date,
    default: Date.now,
  },
  discount_role: {
    type: Array,
  },
  numberOfHour: {
    type: Number,
    require: true,
  },
  employee_ref: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
  },
});
const Payment = mongoose.model("Payment", PaymentSchema);

module.exports = {
  Client,
  Payment,
};

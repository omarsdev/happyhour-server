const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Employee
const EmployeeSchema = new mongoose.Schema({
  first_name: {
    type: String,
    required: [true, "Please Insert First Namr"],
    maxLength: 30,
  },
  last_name: {
    type: String,
    required: [true, "Please Insert Laast Namr"],
    maxLength: 30,
  },
  phone_numebr: [
    {
      type: String,
      required: [true, "Please Insert First Namr"],
      maxLength: 10,
    },
  ],
  email: {
    type: String,
    required: [true, "Please Insert Email"],
    maxLength: 50,
    unique: true,
  },
  password: {
    type: String,
    maxLength: 255,
    select: false,
    minlenght: 6,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
    required: true,
  },
  birthday: {
    type: Date,
    required: true,
  },
  place_of_residence: {
    type: String,
  },
  telphone: [
    {
      type: String,
      maxlength: 10,
    },
  ],
  business_email: {
    type: String,
    maxlength: 80,
  },
  business_phone: {
    type: String,
    maxlength: 10,
  },
  country: {
    type: mongoose.Schema.ObjectId,
    ref: "Country",
  },
  city: {
    type: mongoose.Schema.ObjectId,
    ref: "City",
  },
  street: {
    type: String,
  },
  role: {
    type: String,
    enum: [
      "admin",
      "admin_manager",
      "jr_admin",
      "hr",
      "call_center",
      "sales_director",
      "sales_employee",
    ],
  },
  delete_account: {
    type: Boolean,
    default: false,
  },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
});

//Encypt password using Bycrpt

EmployeeSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

///Sign JWT and return
EmployeeSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

//Match User Entered password to hashed password in database
EmployeeSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Employee", EmployeeSchema);

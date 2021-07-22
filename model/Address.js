const mongoose = require("mongoose");

const CountrySchema = new mongoose.Schema({
  name_en: {
    type: "string",
    required: [true, "Country Can not be empty!!"],
    unique: true,
  },
  name_ar: {
    type: "string",
    required: [true, "Country Can not be empty!!"],
    unique: true,
  },
  code: {
    type: "string",
    required: [true, "Phone Code Number Can not be empty"],
    unique: true,
  },
  city:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "City",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  timezone: {
    type: String,
    required: true,
  }
});

const Country = mongoose.model("Country", CountrySchema);

const CitySchema = new mongoose.Schema({
  name_en: {
    type: "string",
    required: [true, "City Can not be empty!!"],
    unique: true,
  },
  name_ar: {
    type: "string",
    required: [true, "City Can not be empty!!"],
    unique: true,
  },
  street:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Street",
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const City = mongoose.model("City", CitySchema);

const StreetSchema = new mongoose.Schema({
  name_en: {
    type: "string",
    required: [true, "Street Can not be empty!!"],
    unique: true,
  },
  name_ar: {
    type: "string",
    required: [true, "Street Can not be empty!!"],
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Street = mongoose.model("Street", StreetSchema);

module.exports = { Country, City, Street };

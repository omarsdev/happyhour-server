const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const { Country, City, Street } = require("../model/Address");

//Address
exports.getAddress = asyncHandler(async (req, res, next) => {
  const country = await Country.find().populate({
    path: "city",
    populate: {
      path: "street",
    },
  });

  res.status(200).json({
    success: true,
    count: country.length,
    data: country,
  });
});

//-------------------------------Country-------------------------------

exports.getCountries = asyncHandler(async (req, res, next) => {
  const country = await Country.find().select("-city");

  res.status(200).json({
    success: true,
    count: country.length,
    data: country,
  });
});

exports.getCountry = asyncHandler(async (req, res, next) => {
  const country = await Country.findById(req.params.id).select("-city");

  if (!country) {
    return next(
      new ErrorResponse(`Country not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: country.length,
    data: country,
  });
});

exports.createCountry = asyncHandler(async (req, res, next) => {
  const country = await Country.create(req.body);
  res.status(201).json({
    success: true,
    data: country,
  });
});

//-------------------------------City-------------------------------

exports.getCities = asyncHandler(async (req, res, next) => {
  const country = await Country.findById(req.params.countryid)
    .populate("city")
    .select("city");
  // const city = await City.find().where("country").in(req.params.countryid);
  res.status(200).json({
    success: true,
    count: country.city.length,
    data: country.city,
  });
});

exports.getCity = asyncHandler(async (req, res, next) => {
  // const id = req.params.id;
  const country = await Country.findById(req.params.countryid)
    .select({ city: { $elemMatch: { $eq: req.params.id } } })
    .populate("city");
  if (!country) {
    return next(
      new ErrorResponse(
        `Country not found with id of ${req.params.countryid}`,
        404
      )
    );
  }

  if (country.city.length === 0) {
    return next(
      new ErrorResponse(`City not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: country.city[0],
  });
});

exports.createCity = asyncHandler(async (req, res, next) => {
  const id = req.params.countryid;
  const country = await Country.findById(id);
  if (!country) {
    return next(new ErrorResponse(`Country not found with id ${id}`, 404));
  }
  const city = await City.create(req.body);
  await country.update({
    $push: { city: city._id },
  });
  res.status(201).json({
    success: true,
    data: city,
  });
});

//-------------------------------Street-------------------------------

exports.getStreets = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.cityid)
    .populate("street")
    .select("street");
  // const city = await City.find().where("country").in(req.params.countryid);
  res.status(200).json({
    success: true,
    count: city.street.length,
    data: city.street,
  });
});

exports.getStreet = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.cityid)
    .select({ street: { $elemMatch: { $eq: req.params.id } } })
    .populate("street");
  if (!city) {
    return next(
      new ErrorResponse(
        `City not found with id of ${req.params.countryid}`,
        404
      )
    );
  }

  if (city.street.length === 0) {
    return next(
      new ErrorResponse(`Street not found with id of ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    data: city.street[0],
  });
});

exports.createStreet = asyncHandler(async (req, res, next) => {
  const city = await City.findById(req.params.cityid);
  if (!city) {
    return next(
      new ErrorResponse(`City not found with id of ${req.params.cityid}`, 404)
    );
  }

  const street = await Street.create(req.body);
  await city.update({
    $push: { street: street._id },
  });
  res.status(201).json({
    success: true,
    data: street,
  });
});

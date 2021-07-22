const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const UBPoints = require("../model/UBPoints");

//get all User Brand Points
exports.getAllUserBrandPoints = asyncHandler(async (req, res, next) => {
  const uBPoint = await UBPoints.find({
    user_id: req.params.user_id,
  }).populate({
    path: "brand_id",
    select: "name_en name_ar logo categoryid",
    populate: {
      path: "categoryid",
      select: "name_en name_ar",
    },
  });

  res.status(200).json({
    success: true,
    data: uBPoint,
  });
});

//get for spesific user and spesific brand
exports.getSpesificUserBrnadPoint = asyncHandler(async (req, res, next) => {
  const uBPoint = await UBPoints.findById({
    user_id: req.user._id,
    brand_id: req.params.brnadid,
  }).populate({
    path: "brand_id",
    select: "name_en name_ar logo categoryid",
    populate: {
      path: "categoryid",
      select: "name_en name_ar",
    },
  });
  res.status(200).json({
    success: true,
    data: uBPoint,
  });
});

exports.getOnlyCardPoint = asyncHandler(async (req, res, next) => {
  const user = await UBPoints.findOne({
    brand_id: req.params.brandid,
    user_id: req.user._id,
  }).select("points cards");

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.createUserCardPoint = asyncHandler(async (req, res, next) => {
  const user = await UBPoints.create({
    brand_id: req.params.brnadid,
    user_ref: req.user._id,
    points: 20,
    cards: 2,
  });

  res.json({
    success: true,
    data: user,
  });
});

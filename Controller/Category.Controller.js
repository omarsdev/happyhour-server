const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const { Category, Sub } = require("../model/Category");

//-----------------------------Category-----------------------------

exports.getCategories = asyncHandler(async (req, res, next) => {
  const category = await Category.find({ parentId: null });

  res.status(200).json({
    success: true,
    count: category.length,
    data: category,
  });
});

exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await Category.create(req.body);
  res.status(201).json({
    success: true,
    data: category,
  });
});

// get category Children
exports.getCategoryChildren = asyncHandler(async (req, res, next) => {
  const sub = await Category.find({ parentId: req.params.parentid });
  res.status(200).json({
    success: true,
    data: sub,
  });
});

exports.getCategoryByID = asyncHandler(async (req, res, next) => {
  const category = await Category.findById(req.params.id);
  res.status(200).json({
    success: true,
    data: category,
  });
});

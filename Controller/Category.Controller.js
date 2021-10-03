const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const { Category, Sub } = require("../model/Category");
const User = require("../model/User");

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

exports.setUserCategory = asyncHandler(async (req, res, next) => {
  const categoryID = req.params.categoryId;
  const userID = req.user._id;
  // 1- check categoryID
  const category = await Category.findOne(
    { _id: categoryID },
    {
      intrestedUser: {
        $elemMatch: { $eq: userID },
      },
    }
  );

  // 2 - not category id snd error
  if (!category) {
    return next(new ErrorResponse(`category not found`, 404));
  } else if (category.intrestedUser.length > 0) {
    return next(
      new ErrorResponse(`You Are Already Intrested is this category`, 400)
    );
  }

  // 3 - there is Category Id update CategryID and push user_id into it
  await Category.findByIdAndUpdate(categoryID, {
    $addToSet: {
      intrestedUser: userID,
    },
  });

  // 4 - then push category id into user table intredtedCategory
  await User.findByIdAndUpdate(userID, {
    $addToSet: {
      interestedCategory: categoryID,
    },
  });

  res.json({
    success: true,
  });
});

exports.removeUserCategory = asyncHandler(async (req, res, next) => {
  const categoryID = req.params.categoryId;
  const userID = req.user._id;

  // 1- check categoryID
  const category = await Category.findOne(
    { _id: categoryID },
    {
      intrestedUser: {
        $elemMatch: { $eq: userID },
      },
    }
  );

  // 2 - not category id snd error
  if (!category) {
    return next(new ErrorResponse(`category not found`, 404));
  } else if (category.intrestedUser.length === 0) {
    return next(
      new ErrorResponse(`You Are Not Intrested is this category`, 400)
    );
  }

  // 3 - remove user id from array in category
  await Category.findByIdAndUpdate(categoryID, {
    $pull: {
      intrestedUser: userID,
    },
  });

  // 4 - remove categoryId from array in User called intrestedCategory
  await User.findByIdAndUpdate(userID, {
    $pull: {
      interestedCategory: categoryID,
    },
  });

  res.json({
    success: true,
  });
});

const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const { Brand, Branche } = require("../model/Brand");
const User = require("../model/User");
const Casher = require("../model/Casher");
const { Client } = require("../model/Client");
const { sendNotification } = require("../utils/sendNotification");
//get caher for brand
exports.getCashersBrand = asyncHandler(async (req, res, next) => {
  const casher = await Brand.findById(req.params.brandid)
    .select("branche")
    .populate({
      path: "branche",
      select: "casher",
    });

  res.json({
    success: true,
    data: casher,
  });
});

//get cahser for branche
exports.getCahserBranche = asyncHandler(async (req, res, next) => {
  const branche = await Branche.findById(req.params.branchid)
    .select("casher")
    .populate({
      path: "casher",
      select: "-interestedBrand -historySearch -createdAt",
    });

  res.status(200).json({
    success: true,
    data: branche.casher,
  });
});

exports.setCahserForBrache = asyncHandler(async (req, res, next) => {
  //check if brandid and verficationcode is exists
  const checkBrand = await Branche.findById(req.params.branchid)
    .populate({
      path: "brand_ref",
      select: "logo name_en name_ar",
    })
    .select("brand_ref")
    .where("_id")
    .in(req.params.branchid)
    .where("brand_ref")
    .in(req.params.brandid);

  if (!checkBrand) {
    return next(new ErrorResponse(`brnad or branceh not found`, 400));
  }
  // console.log(checkBrand.brand_ref.logo);
  const user = await User.findOneAndUpdate(
    {
      phone_number: req.body.phone_number.toString(),
    },
    {
      $push: {
        notification: {
          typeOfNotification: "setCasher",
          brandId: req.params.brandid,
          brancheId: req.params.branchid,
          logo: checkBrand.brand_ref.logo,
          message: `${checkBrand.brand_ref.name_en} Wants to appoints you as Casher`,
        },
      },
    }
  ).select("username role notificationToken");

  // console.log(user);

  if (!user) {
    return next(new ErrorResponse(`user not found`));
  }

  await sendNotification(
    user.notificationToken,
    "Casher Request",
    `${checkBrand.brand_ref.name_en} appoints you as Casher`,
    checkBrand.brand_ref.logo
  );

  //TODO if user is already casher
  if (user.role !== "user") {
    return next(new ErrorResponse(`This user cannot be casher`, 400));
  }

  //1 - update user role
  const updateUser = await User.findByIdAndUpdate(user._id, {
    role: "casher",
  });
  if (!updateUser) {
    return next(new ErrorResponse(`Please try Again`, 400));
  }
  var addCasher = await Casher.create({
    _id: user._id,
    brandId: req.params.brandid,
    branchId: req.params.branchid,
  });
  // if (!addCasher) {
  //   await User.findByIdAndUpdate(user[0]._id, {
  //     role: "user",
  //   });
  //   return next(new ErrorResponse(`Please try Again`, 400));
  // }

  // //3 - update branche schema to add the new casher
  const addCasherBranche = await Branche.findByIdAndUpdate(
    req.params.branchid,
    {
      $push: { casher: user._id },
    }
  );
  // if (!addCasherBranche) {
  //   await User.findByIdAndUpdate(user._id, {
  //     role: "user",
  //   });
  //   await Casher.findByIdAndDelete(user[0]._id);
  //   return next(new ErrorResponse(`Please try Again`, 400));
  // }
  //4 -
  res.status(201).json({
    success: true,
  });
  //TODO if user is not casher
});

exports.userConfirmCasherRequest = asyncHandler(async (req, res, next) => {
  const updateUserToCasher = await User.findByIdAndUpdate(req.user._id, {
    role: "casher",
  });

  if (!updateUserToCasher) {
    return next(new ErrorResponse(`Please try Again`, 400));
  }
  var addCasher = await Casher.create({
    _id: req.user._id,
    brandId: req.params.brandid,
    branchId: req.params.branchid,
  });
  const addCasherBranche = await Branche.findByIdAndUpdate(
    req.params.branchid,
    {
      $push: { casher: req.user._id },
    }
  );
  res.status(201).json({
    success: true,
  });
});

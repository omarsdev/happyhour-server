const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { Brand, Branche } = require("../model/Brand");
const { Client } = require("../model/Client");
const { Category } = require("../model/Category");

const moment = require("moment");

//-----------------------------Brand-----------------------------

exports.createBrand = asyncHandler(async (req, res, next) => {
  // console.log(req.user._id);

  const client = await Client.findById(req.user._id);
  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.user._id}`, 404)
    );
  }

  // const brand = await Brand.create(req.body);
  const { name_en, name_ar, social_media, date_created_company, categoryid } =
    req.body;
  const category = await Category.findById(categoryid);
  if (!category) {
    return next(
      new ErrorResponse(`Category not found with id of ${categoryid}`, 404)
    );
  }
  const brand = await Brand.create({
    name_en,
    name_ar,
    social_media,
    date_created_company,
    categoryid,
    clientid: req.user._id,
  });

  if (!brand) {
    return next(
      new ErrorResponse(`Please try to cretae your brand another time`, 400)
    );
  }

  //Make Brand Folder inside Client Folder
  //./images/client/1239172347120957234/brand/ {{BRAND_ID}}
  const clientID = req.user._id;
  const clientDir = path.normalize(process.env.FILE_UPLOAD_PATH_CLIENT);

  const BrandDirStore = clientDir.concat("/", clientID, `/${brand._id}/store`);
  const BrandDirAds = clientDir.concat("/", clientID, `/${brand._id}/ads`);
  const BrandDirGift = clientDir.concat("/", clientID, `/${brand._id}/gift`);
  const BrandDirProfile = clientDir.concat(
    "/",
    clientID,
    `/${brand._id}/profile`
  );

  const storeads = [BrandDirStore, BrandDirAds, BrandDirProfile, BrandDirGift];

  storeads.forEach((dirr) => {
    if (!fs.existsSync(dirr)) {
      fs.mkdirSync(dirr, { recursive: true }, async function (err) {
        if (err) {
          console.log(err);
          await Brand.findByIdAndDelete(brand._id);
          return next(new ErrorResponse(`Please try Again`, 400));
        } else {
          console.log("New directory successfully created.");
        }
      });
    }
  });

  await client.updateOne({ $push: { brand: brand._id } });

  res.status(200).json({
    success: true,
    data: brand,
  });
});

exports.getBrands = asyncHandler(async (req, res, next) => {
  const brand = await Brand.find();

  res.status(200).json({
    success: true,
    count: brand.length,
    data: brand,
  });
});
//Get All Brand For Specific Client
exports.getBrand = asyncHandler(async (req, res, next) => {
  const brand = await Client.findById(req.user._id)
    .select("brand")
    .populate("brand");

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }
  let NBrand = brand.brand;
  NBrand = JSON.stringify(NBrand);
  NBrand = JSON.parse(NBrand);

  NBrand.forEach((element) => {
    if (element.logo !== "no-photo.jpg") {
      element.logo = process.env.CURRENT_PATH + element.logo;
    }
    if (element.cover !== "no-photo.jpg") {
      element.cover = process.env.CURRENT_PATH + element.cover;
    }
  });

  res.status(200).json({
    success: true,
    count: NBrand.length,
    data: NBrand,
  });
});

exports.getBrandByID = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id).populate({
    path: "categoryid",
    select: "name_en name_ar parentId hasSize",
  });

  // console.log(brand.Rate);
  let findUserRate = false;
  let findUserIndex = null;
  let userRate = null;
  let userComment = null;
  let allRateCounter = [0, 0, 0, 0, 0];

  brand.Rate.forEach((element, index) => {
    if (element.rate === 1) {
      allRateCounter[0] = allRateCounter[0] + 1;
    } else if (element.rate === 2) {
      allRateCounter[1] = allRateCounter[1] + 1;
    } else if (element.rate === 3) {
      allRateCounter[2] = allRateCounter[2] + 1;
    } else if (element.rate === 4) {
      allRateCounter[3] = allRateCounter[3] + 1;
    } else if (element.rate === 5) {
      allRateCounter[4] = allRateCounter[4] + 1;
    }
    if (req.user._id.toString() === element.user_ref.toString()) {
      findUserRate = true;
      findUserIndex = index;
      userRate = element.rate;
      userComment = element.comment;
    }
  });

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }

  const userID = req.user.id;
  let isFound = false;

  let NBrand = brand;
  NBrand = JSON.stringify(NBrand);
  NBrand = JSON.parse(NBrand);

  //if there is photo
  if (NBrand.logo !== "no-photo.jpg") {
    NBrand.logo = process.env.CURRENT_PATH + NBrand.logo;
  }

  if (NBrand.cover !== "no-photo.jpg") {
    NBrand.cover = process.env.CURRENT_PATH + NBrand.cover;
  }

  NBrand["allRateCounter"] = allRateCounter;
  NBrand["RateLength"] = brand.Rate.length;

  if (findUserRate) {
    NBrand["userRate"] = userRate;
    NBrand["userComment"] = userComment;
  }
  delete NBrand["Rate"];

  NBrand.interestedUser.forEach((element) => {
    if (element.toString() === userID.toString()) {
      isFound = true;
      return;
    }
  });

  if (isFound) {
    NBrand["isIntreested"] = isFound;
    NBrand["intrestedUser"] = NBrand.interestedUser.length;
    delete NBrand["interestedUser"];
    res.status(200).json({
      success: true,
      data: NBrand,
    });
  } else {
    NBrand["isIntreested"] = isFound;
    NBrand["intrestedUser"] = NBrand.interestedUser.length;
    delete NBrand["interestedUser"];
    res.status(200).json({
      success: true,
      data: NBrand,
    });
  }
});

exports.getSmallInfo = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id)
    .select("name_en name_ar logo")
    .populate({
      path: "categoryid",
      select: "name_en name_ar",
    });

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: brand,
  });
});

//upload Photo For Brand
exports.uploadCoverPhoto = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Make Sure its owner or admin
  if (
    brand.clientid.toString() !== req.user._id &&
    req.user.role !== "client"
  ) {
    return next(
      new ErrorResponse(
        `Client ${req.params.id} is not authorized to update this brand`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.cover;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `cover_${brand._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH_CLIENT}/${brand.clientid}/${brand._id}/profile/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      await Brand.findByIdAndUpdate(req.params.id, {
        cover: `${process.env.CLIENT}/${brand.clientid}/${brand._id}/profile/${file.name}`,
      });

      res.status(200).json({
        success: true,
        data: file.name,
      });
    }
  );
});

//Search For Brand By Name
exports.searchBrand = asyncHandler(async (req, res, next) => {
  const { name_en, name_ar } = req.query;

  if (name_en) {
    const regex = new RegExp(name_en, "i"); // i for case insensitive
    const brandResult = await Brand.find({ name_en: { $regex: regex } }).select(
      "name_en name_ar"
    );

    res.status(201).json({
      success: true,
      data: brandResult,
    });
  } else {
    const regex = new RegExp(name_ar, "i"); // i for case insensitive
    const brandResult = await Brand.find({ name_ar: { $regex: regex } }).select(
      "name_en name_ar"
    );

    res.status(201).json({
      success: true,
      data: brandResult,
    });
  }
});

//upload Photo For Brand
exports.uploadLogoPhoto = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.id);
  if (!brand) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  //Make Sure its owner or admin
  if (
    brand.clientid.toString() !== req.user._id &&
    req.user.role !== "client"
  ) {
    return next(
      new ErrorResponse(
        `Client ${req.params.id} is not authorized to update this brand`,
        401
      )
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.logo;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `logo_${brand._id}_${Date.now()}${path.parse(file.name).ext}`;

  file.mv(
    `${process.env.FILE_UPLOAD_PATH_CLIENT}/${brand.clientid}/${brand._id}/profile/${file.name}`,
    async (err) => {
      if (err) {
        console.error(err);
        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      await Brand.findByIdAndUpdate(req.params.id, {
        logo: `${process.env.CLIENT}/${brand.clientid}/${brand._id}/profile/${file.name}`,
      });

      res.status(200).json({
        success: true,
        data: file.name,
      });
    }
  );
});

//Get All Brand For Specific Client for Employee
exports.getBrandByEmloyee = asyncHandler(async (req, res, next) => {
  const brand = await Client.findById(req.params.client)
    .select("brand")
    .populate("brand");

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: brand.brand.length,
    data: brand.brand,
  });
});

exports.addUserRate = asyncHandler(async (req, res, next) => {
  const brandId = req.params.brandId;
  const { rate, comment } = req.body;

  if (rate <= 0 || rate > 5) {
    return next(
      new ErrorResponse(`Your rate must be between 0 and 5 only`, 400)
    );
  }

  const user = await Brand.findById(brandId).select("Rate");
  // console.log(user);
  let findUserRate = false;
  user.Rate.forEach((element, index) => {
    if (element.user_ref.toString() === req.user._id.toString()) {
      findUserRate = true;
    }
  });

  if (findUserRate) {
    return next(new ErrorResponse(`You Already Has a Rate`, 400));
  }

  const userRate = await Brand.findByIdAndUpdate(brandId, {
    $push: {
      Rate: {
        rate,
        comment,
        user_ref: req.user._id,
      },
    },
  });

  let forloopRate = 0;
  userRate.Rate.forEach((element, index) => {
    forloopRate += element.rate;
  });

  const RateAvg = (forloopRate + rate) / (userRate.Rate.length + 1);
  const userRate1 = await Brand.findByIdAndUpdate(brandId, {
    rateAvg: RateAvg,
  });

  res.status(201).json({
    success: true,
  });
});

exports.updateUserRate = asyncHandler(async (req, res, next) => {
  const brandId = req.params.brandId;
  const { rate, comment } = req.body;

  if (rate < 0 || rate > 5) {
    return next(
      new ErrorResponse(`Your rate must be between 0 and 5 only`, 400)
    );
  }

  const user = await Brand.findById(brandId).select("Rate");
  // console.log(user);
  let findUserRate = false;
  const usersRates = user.Rate;
  let userRateIndex = null;
  user.Rate.forEach((element, index) => {
    if (element.user_ref.toString() === req.user._id.toString()) {
      findUserRate = true;
      userRateIndex = index;
    }
  });

  if (!findUserRate) {
    return next(
      new ErrorResponse(
        `can't update you rate cause you already dont have any rate yet.`,
        400
      )
    );
  } else {
    usersRates[userRateIndex].rate = rate;
    usersRates[userRateIndex].comment = comment;
    // console.log(usersRates);

    const rateUserLength = usersRates.length;
    let rateUser = 0;
    usersRates.forEach((element) => {
      rateUser += element.rate;
    });

    rateAvg = rateUser / rateUserLength;
    await Brand.findByIdAndUpdate(brandId, {
      Rate: usersRates,
      rateAvg: rateAvg,
    });

    res.json({
      success: true,
    });
  }
});

//-----------------------------Branches-----------------------------
exports.createBranche = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid);

  if (req.user.id.toString() !== brand.clientid.toString()) {
    return next(
      new ErrorResponse(
        `Not Autherize to access this area ${req.params.brandid}`,
        400
      )
    );
  }

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.brandid}`, 404)
    );
  }

  const { name_en, name_ar, address, telephone_number, city, street } =
    req.body;

  const branche = await Branche.create({
    name_en,
    name_ar,
    city,
    street,
    brand_ref: req.params.brandid,
    telephone_number,
  });

  if (branche) {
    await Brand.findByIdAndUpdate(req.params.brandid, {
      $push: { branche: branche._id },
    });
  } else {
    return next(
      new ErrorResponse(
        `Opps Some Error Comes Please Try Again ${req.params.brandid}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    data: branche,
  });
});

exports.getBranches = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid)
    .populate("branche")
    .select("branche");
  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.brandid}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    count: brand.branche.length,
    data: brand.branche,
  });
});

exports.updateBranches = asyncHandler(async (req, res, next) => {
  const { name_en, name_ar, address, telephone_number } = req.body;
  // const brand = await Brand.findOneAndUpdate(
  //   { _id: req.params.brandid, "branche._id": req.params.id },
  //   {
  //     $set: {
  //       "branche.$.name_en": name_en,
  //       "branche.$.name_ar": name_ar,
  //       "branche.$.address": address,
  //     },
  //   }
  // );

  const brand = await Brand.findById(req.params.brandid);

  if (req.user.id.toString() !== brand.clientid.toString()) {
    return next(
      new ErrorResponse(
        `Not Autherize to access this area ${req.params.brandid}`,
        400
      )
    );
  }

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.brandid}`, 404)
    );
  }

  if (req.user.id.toString() !== brand.clientid.toString()) {
    return next(
      new ErrorResponse(
        `Not Autherize to access this area ${req.params.brandid}`,
        400
      )
    );
  }

  const branche = await Branche.findByIdAndUpdate(req.params.id, {
    name_en,
    name_ar,
    address,
    telephone_number,
  });

  if (!branche) {
    return next(
      new ErrorResponse(`Branche Not Found With Id if ${req.params.id}`, 404)
    );
  }
  res.status(200).json({
    success: true,
  });
});

// Intrested
exports.brandIntrested = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandId)
    .where("clientid")
    .in(req.user._id)
    .populate({
      path: "interestedUser",
      select: "gender birthday",
    })
    .select("interestedUser");

  if (!brand) {
    return next(new ErrorResponse("Not Autherize to Access this route", 401));
  }

  let NBrand = brand;
  NBrand = JSON.stringify(NBrand);
  NBrand = JSON.parse(NBrand);

  let maleCount = 0;
  let femaleCount = 0;

  let male18And30 = 0;
  let male31And50 = 0;
  let maleAbove50 = 0;

  let female18And30 = 0;
  let female31And50 = 0;
  let femaleAbove50 = 0;

  const intrestedCount = NBrand.interestedUser.length;

  NBrand.interestedUser.forEach((element) => {
    if (element.gender === "Male") {
      maleCount++;
    } else {
      femaleCount++;
    }
    var years = moment().diff(element.birthday, "years");
    if (years > 18 && years <= 30 && element.gender === "Male") {
      male18And30++;
    } else if (years > 18 && years <= 30 && element.gender === "Female") {
      female18And30++;
    } else if (years > 31 && years <= 50 && element.gender === "Male") {
      male31And50++;
    } else if (years > 31 && years <= 50 && element.gender === "Female") {
      female31And50++;
    } else if (years > 50 && element.gender === "Male") {
      maleAbove50++;
    } else if (years > 50 && element.gender === "Female") {
      femaleAbove50++;
    }
    element["age"] = years;
  });

  delete NBrand.interestedUser;

  NBrand["maleCount"] = maleCount;
  NBrand["femaleCount"] = femaleCount;

  NBrand["male18And30"] = male18And30;
  NBrand["male31And50"] = male31And50;
  NBrand["maleAbove50"] = maleAbove50;

  NBrand["female18And30"] = female18And30;
  NBrand["female31And50"] = female31And50;
  NBrand["femaleAbove50"] = femaleAbove50;

  NBrand["intrestedCount"] = intrestedCount;

  res.json({
    success: true,
    data: NBrand,
  });
});

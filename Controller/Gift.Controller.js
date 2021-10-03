const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const Gift = require("../model/Gift");
const { Client } = require("../model/Client");
const { Brand } = require("../model/Brand");
const { VerficationGift, VerficationAds } = require("../model/Verfication");
const User = require("../model/User");
const Casher = require("../model/Casher");
const UBPoints = require("../model/UBPoints");

const moment = require("moment-timezone");

exports.getAllGifts = asyncHandler(async (req, res, next) => {
  //TODO Rate User
  const gifts = await Gift.find().populate({
    path: "brand",
    select: "name_en name_ar logo categoryid",
    populate: {
      path: "categoryid",
      select: "name_en name_ar",
    },
  });
  // .select("brand");

  let NGift = JSON.parse(JSON.stringify(gifts));

  // NGift.brand;
  NGift.forEach((element, index) => {
    NGift[index].photo = process.env.CURRENT_PATH + element.photo;
  });

  res.status(200).json({
    success: true,
    data: NGift,
  });
});

exports.getAllGift = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid)
    .select("name_en name_ar logo categoryid gift")
    .populate({
      path: "categoryid",
      select: "name_en name_ar",
    })
    .populate({
      path: "gift",
      options: { sort: { createdAt: -1 } },
      select: "-brand",
    });

  if (!brand) {
    return next(
      new ErrorResponse(`Brnad Not Found with id of ${req.params.brandid}`)
    );
  }
  let giftArr = [];
  brand.gift.forEach((gift) => {
    gift = JSON.parse(JSON.stringify(gift));
    gift["brand"] = {};
    gift["brand"]["logo"] = process.env.CURRENT_PATH + brand.logo;
    gift["brand"]["_id"] = brand._id;
    gift["brand"]["name_en"] = brand.name_en;
    gift["brand"]["name_ar"] = brand.name_ar;
    gift["brand"]["categoryid"] = brand.categoryid;
    giftArr.push(gift);
  });

  giftArr.forEach((element, index) => {
    giftArr[index].photo = process.env.CURRENT_PATH + element.photo;
    // console.log(element.photo);
  });

  res.json({
    success: true,
    data: giftArr,
  });

  // res.json({
  //   brand: brand,
  // });
});

exports.createNewBrandGift = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid)
    .where("clientid")
    .in(req.user._id);
  if (!brand) {
    return next(new ErrorResponse(`Not autherize to access this brand`, 401));
  }
  //TODO handle is there any photo

  // console.log(req.body);

  let photo = req.files.photo;
  if (!photo) {
    return next(new ErrorResponse(`Please Upload Your Photo`, 400));
  }

  //TODO Body in req.body
  // const {
  //   model_number,
  //   description,
  //   price_in_points,
  //   price_on_card,
  //   quantity,
  // } = req.body;

  // const body = JSON.parse(req.files.text.data);
  const body = req.body;
  const {
    model_number,
    description,
    price_in_points,
    price_on_card,
    quantity,
    giftTeamplate,
    destroyCodeTimer,
  } = body;

  const gift = await Gift.create({
    model_number,
    description,
    price_in_points,
    price_on_card,
    quantity,
    giftTeamplate,
    destroyCodeTimer,
    brand: req.params.brandid,
  });

  //cretae folder in gift
  const dir = gift._id.toString();
  const giftPath = `${process.env.FILE_UPLOAD_PATH_CLIENT}/${req.user._id}/${req.params.brandid}/gift`;
  const finallPath = giftPath.concat("/", dir);

  if (!fs.existsSync(finallPath)) {
    fs.mkdirSync(finallPath);
  }

  //Make Sure that the photo is actuly Image
  if (!photo.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }
  //Create Custome Gift name
  photo.name = `giftPhoto-${gift._id}-1${path.parse(photo.name).ext}`;

  //Move Phot to gift Folder
  photo.mv(`${finallPath}/${photo.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }
    const newImage = `${process.env.Client}/${req.user._id}/${req.params.brandid}/gift/${gift._id}/${photo.name}`;
    // console.log(newImage);
    await Gift.findByIdAndUpdate(gift._id, {
      photo: newImage,
    });
  });

  //Update Brand To Add New Gift
  const UpdateBrand = await Brand.findByIdAndUpdate(req.params.brandid, {
    $push: { gift: gift._id },
  });

  res.status(201).json({
    success: true,
    data: gift,
  });
});

exports.updategift = asyncHandler(async (req, res, next) => {});

// ------------------------------------------------------------ Cacher ------------------------------------------------------------
exports.checkGiftCode = asyncHandler(async (req, res, next) => {
  const code = await VerficationGift.find({ code: req.body.code })
    .populate({
      path: "gift_ref",
      select: "-verficationCode",
      match: { brand: { $eq: req.params.brandid } },
    })
    .populate({
      path: "user_ref",
      select: "first_name last_name username gender",
    });

  if (!code) {
    return next(new ErrorResponse("Code Not Found", 400));
  }
  if (gift[0].gift_ref.brand.toString() !== req.params.brandid.toString()) {
    return next(
      new ErrorResponse(`This Code is not belong to your brand`, 400)
    );
  }
  if (code.expire) {
    return next(new ErrorResponse(`Code is Already in use`, 400));
  }

  res.json({
    success: true,
    data: code,
  });
});

exports.confirmGiftCode = asyncHandler(async (req, res, next) => {
  const code = req.codeStatus;
  if (code === "Offer") {
    // 1- check if there is verfication Code
    const offer = await VerficationAds.find({ code: req.body.code })
      .populate({
        path: "offer_ref",
        select: "-verficationCode -happy -views",
      })
      .populate({
        path: "user_ref",
        select: "username gender birthday",
      });
    // 2 - check if there is any code
    if (offer.length === 0) {
      return next(new ErrorResponse(`Code Not Found`));
    }
    // check brand owner for the code
    else if (
      offer[0].offer_ref.brand.toString() !== req.params.brandid.toString()
    ) {
      return next(
        new ErrorResponse(`This Code is not belong to your brand`, 400)
      );
    }
    // check expire code
    else if (offer[0].expire) {
      return next(new ErrorResponse(`Code is Already in use`, 400));
    }
    // 3 - find UserBrnadPoint
    let UserBrandPoint = await UBPoints.find({
      user_id: offer[0].user_ref._id,
      brand_id: req.params.brandid,
    });

    if (UserBrandPoint.length === 0) {
      return next(
        new ErrorResponse(`User does not have any Points in your brand`, 400)
      );
      UserBrandPoint = await UBPoints.create({
        user_id: offer[0].user_ref._id,
        brand_id: req.params.brandid,
      });
    }
    const total = UserBrandPoint[0].cards * 100 + UserBrandPoint[0].points;
    const totalOffer =
      offer[0].offer_ref.price_on_card * 100 +
      offer[0].offer_ref.price_in_points;

    //caculate new User PINT BRAND
    const result = total + totalOffer;
    const userCard = parseInt(result / 100);
    const userPoints = result % 100;

    const UBP = await UBPoints.findByIdAndUpdate(UserBrandPoint[0]._id, {
      points: userPoints,
      cards: userCard,
      $push: {
        logs: {
          desc: `Your Code has benn confirmed and you added Card:${offer[0].offer_ref.price_on_card} Points: ${offer[0].offer_ref.price_in_points}`,
        },
      },
    });
    const verfication = await VerficationAds.findByIdAndUpdate(offer[0]._id, {
      expire: true,
      used_at: moment.utc(),
    });

    const casherLogs = await Casher.findByIdAndUpdate(req.user._id, {
      $push: {
        gift_log: {
          msg: `Casher confirm Offer Code for ${offer[0].user_ref._id} by Code ${code}`,
          code: req.body.code,
        },
      },
    });

    res.json({
      success: true,
    });
  } else if (code === "Store") {
    //TODO
  } else if (code === "Gift") {
    const gift = await VerficationGift.find({ code: req.body.code })
      .populate({
        path: "gift_ref",
        select: "-verficationCode",
      })
      .populate({
        path: "user_ref",
        select: "username gender birthday ",
      });
    if (gift.length === 0) {
      return next(new ErrorResponse(`Code Not Found`));
    } else if (
      gift[0].gift_ref.brand.toString() !== req.params.brandid.toString()
    ) {
      return next(
        new ErrorResponse(`This Code is not belong to your brand`, 400)
      );
    } else if (gift[0].expire) {
      return next(new ErrorResponse(`Code is Already in use`, 400));
    } else if (gift[0].quantity === 0) {
      return next(
        new ErrorResponse(`This Gift is Not avaalable any more`, 400)
      );
    }
    const UserBrandPoint = await UBPoints.find({
      user_id: gift[0].user_ref._id,
      brand_id: req.params.brandid,
    });
    //if there is a UserBrandPoint
    if (UserBrandPoint.length === 0) {
      return next(
        new ErrorResponse(`User does not have any Points in your brand`, 400)
      );
    }

    const total = UserBrandPoint[0].cards * 100 + UserBrandPoint[0].points;

    const totalGift =
      gift[0].gift_ref.price_on_card * 100 + gift[0].gift_ref.price_in_points;

    if (total < totalGift) {
      return next(
        new ErrorResponse(
          `User doesnot have enough point to buy this gift`,
          400
        )
      );
    }
    const result = total - totalGift;
    const userCard = parseInt(result / 100);
    const userPoints = result % 100;

    // const createUBP = await UBPoints.create({
    //   user_id: gift[0].user_ref._id,
    //   brand_id: req.params.brandid,
    // })

    const UBP = await UBPoints.findByIdAndUpdate(UserBrandPoint[0]._id, {
      points: userPoints,
      cards: userCard,
      $push: {
        logs: {
          desc: "this is new",
        },
      },
    });
    //update Gift Quantity
    const updateGiftQuantity = await Gift.findByIdAndUpdate(
      gift[0].gift_ref._id,
      { quantity: Number(gift[0].gift_ref.quantity) - 1 }
    );
    //update user verfcationGift
    const verficationGift = await VerficationGift.findByIdAndUpdate(
      gift[0]._id,
      {
        expire: true,
        used_at: moment.utc(),
      }
    );
    //update Casher Logs
    const casherLogs = await Casher.findByIdAndUpdate(req.user._id, {
      $push: {
        gift_log: {
          msg: `Casher confirm code`,
          code: req.body.code,
        },
      },
    });
    res.json({
      success: true,
    });
  }
});

// ------------------------------------------------------------ Cacher ------------------------------------------------------------
//TODO get user gift

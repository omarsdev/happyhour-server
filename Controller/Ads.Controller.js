const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const Ads = require("../model/Ads");
const { Brand } = require("../model/Brand");
const { Client } = require("../model/Client");
const { VerficationAds } = require("../model/Verfication");
const User = require("../model/User");
const { permittedCrossDomainPolicies } = require("helmet");

//-----------------------------Ads-----------------------------

exports.getAllAds = asyncHandler(async (req, res, next) => {
  const ads = await Ads.find()
    .where("role")
    .in("start")
    .sort("created_at")
    .populate({
      path: "brand",
      select: "name_en name_ar logo clientid categoryid",
      populate: {
        path: "categoryid",
        select: "name_en name_ar",
      },
    })
    .populate("verficationCode");
  let NAds = ads;
  NAds = JSON.stringify(NAds);
  NAds = JSON.parse(NAds);
  for (let i = 0; i < NAds.length; i++) {
    NAds[i]["happyCount"] = NAds[i].happy.length;
    NAds[i]["adsViews"] = NAds[i].views.length;
    for (let j = 0; j < NAds[i].happy.length; j++) {
      if (NAds[i].happy[j].toString() === req.user.id.toString()) {
        NAds[i]["isHappy"] = true;
        break;
      }
    }
    var BreakException = {};
    try {
      NAds[i].verficationCode.forEach((element1) => {
        if (element1.user_ref.toString() === req.user.id.toString()) {
          NAds[i]["userCode"] = element1.code;
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) throw e;
    }

    delete NAds[i].happy;
    delete NAds[i].views;
    delete NAds[i].verficationCode;
  }

  res.status(200).json({
    success: true,
    data: NAds,
  });
});

exports.getAds = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid).populate({
    path: "ads",
    options: { sort: { created_at: -1 } },
    populate: {
      path: "brand verficationCode",
      select:
        "name_en name_ar logo clientid categoryid expire code ads_ref user_ref",
      populate: {
        path: "categoryid",
        select: "name_en name_ar",
      },
    },
  });
  // .select("ads");

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${brandid}`, 404)
    );
  }

  let NAds = brand.ads;
  NAds = JSON.stringify(NAds);
  NAds = JSON.parse(NAds);
  for (let i = 0; i < NAds.length; i++) {
    NAds[i]["happyCount"] = NAds[i].happy.length;
    NAds[i]["adsViews"] = NAds[i].views.length;
    for (let j = 0; j < NAds[i].happy.length; j++) {
      if (NAds[i].happy[j].toString() === req.user.id.toString()) {
        NAds[i]["isHappy"] = true;
        break;
      }
    }
    // console.log(NAds[i]);
    var BreakException = {};
    try {
      NAds[i].verficationCode.forEach((element1) => {
        if (element1.user_ref.toString() === req.user.id.toString()) {
          NAds[i]["userCode"] = element1.code;
          throw BreakException;
        }
      });
    } catch (e) {
      if (e !== BreakException) throw e;
    }

    delete NAds[i].happy;
    delete NAds[i].views;
    delete NAds[i].verficationCode;
  }

  res.status(200).json({
    success: true,
    count: NAds.length,
    data: NAds,
    // count: brand.ads,
    // data: brand.ads,
  });
});

exports.createAds = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid)
    .where("clientid")
    .in(req.user._id);
  if (!brand) {
    return next(new ErrorResponse(`Brand not found`, 404));
  }

  var { ads_type, start_time, numberofhour, adsPointBrand, ads_teamplate } =
    req.body;
  const description = JSON.parse(req.body.description);
  const discount = JSON.parse(req.body.discount);

  console.log(req.files);

  var adsPhoto = req.files.photo;
  if (!adsPhoto.length) {
    adsPhoto = [adsPhoto];
  }

  if (ads_type !== "Discount" && discount.length !== 0) {
    return next(
      new ErrorResponse(
        `if you Need Discount You Should Have Your ADS Type is Discount`,
        400
      )
    );
  } else if (ads_type === "Discount") {
    if (
      adsPhoto.length !== discount.length ||
      adsPhoto.length !== description.length ||
      description.length !== discount.length
    ) {
      return next(new ErrorResponse(`you must add all fields`, 400));
    }
  } else if (ads_type !== "Discount") {
    if (description.length !== adsPhoto.length) {
      return next(
        new ErrorResponse("Your Ads not the same Count with your Discount")
      );
    }
  }

  const dt = new Date(start_time);
  const end_time = new Date(dt.setHours(dt.getHours() + Number(numberofhour)));

  // console.log("End Time", new Date(end_time));

  const adsController = await Ads.create({
    description,
    ads_type,
    start_time,
    end_time,
    numberofhour,
    discount,
    adsPointBrand,
    ads_teamplate,
    brand: req.params.brandid,
    price_on_card: 20,
    price_in_points: 20,
  });

  //Cretae Ads File
  const dir = adsController._id.toString();
  const adspath = `${process.env.FILE_UPLOAD_PATH_CLIENT}/${req.user._id}/${req.params.brandid}/ads`;
  const finallPath = adspath.concat("/", dir);

  if (!fs.existsSync(finallPath)) {
    fs.mkdirSync(finallPath);
  }

  //Make Sure that the photo is actuly Image
  for (let i = 0; i < adsPhoto.length; i++) {
    if (!adsPhoto[i].mimetype.startsWith("image")) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }
    //Create Custome ADS name
    adsPhoto[i].name = `adsPhoto-${adsController._id}-${i + 1}${
      path.parse(adsPhoto[i].name).ext
    }`;
  }

  for (let i = 0; i < adsPhoto.length; i++) {
    adsPhoto[i].mv(`${finallPath}/${adsPhoto[i].name}`, async (err) => {
      if (err) {
        console.error(err);

        return next(new ErrorResponse(`Problem with file upload`, 500));
      }

      const newImage = `${process.env.URL_PATH}/${req.user._id}/${req.params.brandid}/ads/${adsController._id}/${adsPhoto[i].name}`;

      await Ads.findByIdAndUpdate(adsController._id, {
        $push: {
          photo: newImage,
        },
      });
    });
  }

  const UpdateBrand = await Brand.findByIdAndUpdate(req.params.brandid, {
    $push: { ads: adsController._id },
  });

  res.status(201).json({
    success: true,
    data: adsController,
  });
});

exports.adsPhotoUpload = async (req, res, next) => {
  const ads = await Ads.findById(req.params.id);

  if (!ads) {
    return next(
      new ErrorResponse(`Ads Not Found with id of ${req.params.id}`, 400)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please Upload a File`, 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  //Check File Size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create custom filename
  file.name = `photo_${ads._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(err);
      return next(new ErrorResponse(`Problem with file upload`, 500));
    }

    await Ads.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
};

//_________________ Verfication Code_____________________
//Use Verfication Code
exports.verfyVerficatonCode = asyncHandler(async (req, res, next) => {
  const { code } = req.body;
  const verficationCode = await VerficationAds.find()
    .where("code")
    .in(code)
    .populate({
      path: "user_ref",
      select: "first_name last_name gender username birthday",
    });
  // .where("ads_ref")
  // console.log(verficationCode[0].expire);
  // .in(req.params.adsid);
  if (verficationCode.length === 0) {
    return next(new ErrorResponse(`Code not found`, 404));
  } else if (verficationCode[0].expire) {
    res.status(200).json({
      success: false,
      msg: "This Code is Already Used",
    });
  } else {
    res.status(200).json({
      success: true,
      data: verficationCode,
    });
  }
});

exports.confirmVerfication = asyncHandler(async (req, res, next) => {
  // const { code } = req.body;
  // const verficationCode = await Verfication.find()
  //   .where("code")
  //   .in(code)
  //   .where("ads_ref")
  //   .in(req.params.adsid);
  // if (verficationCode.expire) {
  //   res.status(200).json({
  //     success: true,
  //     msg: "This Code is Already in User",
  //   });
  // }
  // if (verficationCode.length === 0) {
  //   return next(new ErrorResponse(`Code not found`, 404));
  // }

  // const updateVerfication = await Verfication.findByIdAndUpdate(
  //   verficationCode[0]._id,
  //   {
  //     expire: true,
  //     used_at: Date.now(),
  //   }
  // );
  // if (!updateVerfication) {
  //   return next(new ErrorResponse(`Please Try Again`, 401));
  // }
  // res.status(200).json({
  //   sucess: true,
  // });

  // const { code } = req.body;
  // const verficationCode = await Verfication.find({ code })
  //   .populate({
  //     path: "user_ref",
  //     select: "HappyHourPointSystem pointsBrandSystem",
  //   })
  //   .populate({ path: "ads_ref", select: "brand" })
  //   .exec(async function (err, result) {
  // console.log(result[0].user_ref.pointsBrandSystem);
  // console.log(result[0]);
  // console.log(result[0]);
  // var brandid =
  // const brandExists = result[0].user_ref.pointsBrandSystem.map(function (
  //   doc
  // ) {
  //   console.log(doc)
  //   // if (result[0].ads_ref.brand.toString() === doc._id.toString()) {
  //     // return doc._id;
  //     // console.log(doc._id)
  //     // User.findById(result[0].user_ref._id).exec(function (err, user) {
  //     //   console.log(user)
  //     // })
  //   // }
  // });
  // console.log(brandExists);
  // const
  // });

  // const { code } = req.body;
  // const verficationCode = await Verfication.find()
  //   .where("code")
  //   .in(code)
  //   .populate({
  //     path: "user_ref",
  //     select: "first_name last_name gender username birthday",
  //   });
  // res.json({
  //   verficationCode,
  // });

  const verficationCode = await VerficationAds.findOneAndUpdate(
    { _id: req.params.id, expire: false },
    {
      expire: true,
      used_at: Date.now(),
    }
  );

  if (!verficationCode) {
    return next(
      new ErrorResponse(`Code not found with id of ${req.params.id}`, 404)
    );
  }

  res.json({
    success: true,
  });
});

exports.uploadPhotoTest = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // const varPhoto = req.files.photo;
  // if (!varPhoto.length) {
  //   console.log("Not Array");
  //   const array = [varPhoto];
  //   console.log(array);
  // } else {
  //   console.log("Array");
  //   console.log(varPhoto);
  // }

  // console.log(req.body.desc);

  // const arr = [req.body.desc];

  const descriptionArr = JSON.parse(req.body.description);
  const DiscountArr = JSON.parse(req.body.discount);
  const start_time = req.body.start_time;

  // console.log(descriptionArr, "\n", DiscountArr);
  console.log(new Date(req.body.start_time));

  // descriptionArr.forEach((element) => {
  //   console.log("first", element);
  // });

  res.json({
    success: true,
  });
});

const path = require("path");
const sharp = require("sharp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../model/User");
const UserVerfication = require("../model/UserVerfication");

const { Client } = require("../model/Client");
const { VerficationAds } = require("../model/Verfication");

const Ads = require("../model/Ads");
const { Brand } = require("../model/Brand");

const PaymentAccount = require("../model/PaymentAccount");
const { findByIdAndUpdate } = require("../model/PaymentAccount");
const Casher = require("../model/Casher");
// const TrustedComms = require("twilio/lib/rest/preview/TrustedComms");

exports.getUsers = asyncHandler(async (req, res, next) => {
  const user = await User.find(req.query).populate("client");

  res.status(200).json({
    success: true,
    count: user.length,
    data: user,
  });
});

exports.createUser = asyncHandler(async (req, res, next) => {
  const {
    first_name,
    last_name,
    phone_number,
    email,
    username,
    password,
    birthday,
    gender,
    material_status,
    date_marriage,
  } = req.body;

  if (material_status !== "Single" && date_marriage === "") {
    return next(
      new ErrorResponse(`Cannot be Single and have Merrige Date.`, 400)
    );
  }

  const user = await User.create(req.body);
  if (!user) {
    return next(new ErrorResponse(`Please Try Register Again`, 400));
  }
  //TODO check user Verfication
  const userVerfication = await UserVerfication.create({ _id: user._id });
  if (!userVerfication) {
    await User.findByIdAndDelete(user._id);
    return next(new ErrorResponse(`Please Try Register Again`, 400));
  }

  sendTokenResponse(user, 200, res);

  // res.status(201).json({
  //   success: true,
  //   data: user,
  // });
});

//Update User Info
exports.updateuser = asyncHandler(async (req, res, next) => {
  // const { first_name, last_name, email, username } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(
      new ErrorResponse(`User not Found with id OF ${req.user._id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.uploadUserImage = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Create custom filename
  file.name = `photo_${req.user.username}-${req.user._id}${
    path.parse(file.name).ext
  }`;

  sharp(file.data)
    .jpeg({ quality: 20 })
    .toFile(`${process.env.FILE_UPLOAD_PATH_USER}/${file.name}`);

  // file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
  //   if (err) {
  //     console.error(err);
  //     return next(new ErrorResponse(`Problem with file upload`, 500));
  //   }

  //   await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

  //   res.status(200).json({
  //     success: true,
  //     data: file.name
  //   });
  // });

  await User.findByIdAndUpdate(req.user._id, {
    photo: `${process.env.URL_PATH_USER}/${file.name}`,
  });

  res.status(200).json({
    success: true,
    data: file.name,
  });
});

exports.updateToClientAccount = asyncHandler(async (req, res, next) => {
  const { telephone_number, email } = req.body;
  const CreateClientAccount = Client.create({
    _id: req.user._id,
    telephone_number,
    email,
  });
  if (!CreateClientAccount) {
    return next(new ErrorResponse(`Please Try Again`, 400));
  }

  const user = await User.findByIdAndUpdate(req.user._id, {
    role: "client",
  });
  if (!user) {
    return next(
      new ErrorResponse(`User not found with id ${req.user._id}`, 404)
    );
  }

  // const makePaymentAccount = await PaymentAccount.create({
  //   _id: req.params.id,
  // });

  // if(!makePaymentAccount){
  //   return next(new ErrorResponse(`Please Try Again`, 400))
  // }

  // await Client.findByIdAndUpdate(req.params.id, {
  //   paymentAccount: makePaymentAccount._id,
  // });

  res.status(201).json({
    success: true,
  });
});

exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(
      new ErrorResponse(`User not Found with id OF ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { phone_number, password, notificationToken } = req.body;

  // console.log(notificationToken);

  //Validation Phone Number And Password
  if (!phone_number || !password) {
    return next(
      new ErrorResponse("Please Provide an phone Number and password", 400)
    );
  }

  //Check For User
  const user = await User.findOneAndUpdate(
    { phone_number },
    {
      $addToSet: {
        notificationToken: notificationToken,
      },
    }
  ).select("+password");

  if (!user) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //Check if Password Matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  sendTokenResponse(user, 200, res);
});

exports.logoutUser = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

//Get Current Logged in User
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "country city street",
    select: "name_en name_ar",
  });

  let Nuser = user;
  Nuser = JSON.stringify(Nuser);
  Nuser = JSON.parse(Nuser);
  if (user.role === "client") {
    const client = await Client.findById(req.user._id).populate({
      path: "brand",
      select: "name_en name_ar logo categoryid",
      populate: {
        path: "categoryid",
        select: "name_ar name_en",
      },
    });

    Nuser["brand"] = client.brand;
    delete Nuser.verficationCode;
    res.status(200).json({
      sucess: true,
      data: Nuser,
    });
  } else if (user.role === "casher") {
    const casher = await Casher.findById(req.user._id).select("brandId");
    Nuser["brand"] = casher.brandId;
    res.status(200).json({
      sucess: true,
      data: Nuser,
    });
  } else {
    res.status(200).json({
      sucess: true,
      data: user,
    });
  }
});

//Set Intrested for Brand
exports.setIntrested = asyncHandler(async (req, res, next) => {
  const setIntrestedUserBrand = await Brand.find(
    { _id: req.params.brandid },
    { interestedUser: { $elemMatch: { $in: req.user._id } } }
  )
    .exec()
    .then(async function (result) {
      if (result[0].interestedUser.length === 0) {
        await Brand.findByIdAndUpdate(req.params.brandid, {
          $push: { interestedUser: req.user._id },
        })
          .exec()
          .then(async function () {
            // console.log(`${req.params.brandid}`);
            await User.findByIdAndUpdate(req.user._id, {
              $push: { interestedBrand: req.params.brandid },
            });
          })
          .catch(function (err1) {
            return next(new ErrorResponse(`Please try Again ${err1}`, 400));
          });
      } else {
        return next(
          new ErrorResponse(`You are already intrested in Brand`, 400)
        );
      }
    })
    .catch(function (err) {
      return next(
        new ErrorResponse(
          `Brand not found with id of ${req.params.brandid}`,
          404
        )
      );
    });

  res.status(200).json({
    success: true,
  });
});

//Remove Intrested for Brand
exports.removeIntrested = asyncHandler(async (req, res, next) => {
  const removeIntrestedUserBrand = await Brand.find(
    { _id: req.params.brandid },
    { interestedUser: { $elemMatch: { $in: req.user._id } } }
  )
    .exec()
    .then(async function (result) {
      if (result[0].interestedUser.length === 1) {
        await Brand.findByIdAndUpdate(req.params.brandid, {
          $pull: { interestedUser: req.user._id },
        })
          .exec()
          .then(async function () {
            // console.log(`${req.params.brandid}`);
            await User.findByIdAndUpdate(req.user._id, {
              $pull: { interestedBrand: req.params.brandid },
            });
          })
          .catch(function (err1) {
            return next(new ErrorResponse(`Please try Again ${err1}`, 400));
          });
      } else {
        return next(
          new ErrorResponse(`You are already intrested in Brand`, 400)
        );
      }
      // console.log(result[0].interestedUser.length)
    })
    .catch(function (err) {
      return next(
        new ErrorResponse(
          `Brand not found with id of ${req.params.brandid}`,
          404
        )
      );
    });

  res.status(200).json({
    success: true,
  });
});

//set Ads Views
exports.userAdsViews = asyncHandler(async (req, res, next) => {
  // await Ads.find(
  //   { _id: req.params.adsid },
  //   {
  //     views: { $elemMatch: { $in: req.user._id } },
  //   }
  // )
  //   .exec()
  //   .then(async (ads) => {
  //     // res.json(ads[0].happy);
  //     if (ads[0].views.length === 0) {
  //       await ads[0].update({ $push: { views: req.user.id } });
  //     }
  //     // else {
  //     //   return next(new ErrorResponse(`You alredy have a seen this ads`, 400));
  //     // }
  //   })
  //   .catch((err) => {
  //     return next(
  //       new ErrorResponse(`Ads not found with id of ${req.params.adsid}`, 404)
  //     );
  //   });

  await Ads.findByIdAndUpdate(req.params.adsid, {
    $push: { views: req.user.id },
  });

  res.status(200).json({
    success: true,
  });
});

//set Happy
exports.setLike = asyncHandler(async (req, res, next) => {
  await Ads.find(
    { _id: req.params.adsid },
    {
      happy: { $elemMatch: { $in: req.user._id } },
    }
  )
    .exec()
    .then(async (ads) => {
      // res.json(ads[0].happy);
      if (ads[0].happy.length !== 0) {
        return next(
          new ErrorResponse(`You alredy have a like on this ads`, 400)
        );
      } else {
        await ads[0].updateOne({ $push: { happy: req.user.id } });
      }
    })
    .catch((err) => {
      return next(
        new ErrorResponse(`Ads not found with id of ${req.params.adsid}`, 404)
      );
    });

  res.status(200).json({
    success: true,
  });
});
//Remove Happy
exports.unSetLike = asyncHandler(async (req, res, next) => {
  await Ads.find(
    { _id: req.params.adsid },
    {
      happy: { $elemMatch: { $in: req.user._id } },
    }
  )
    .exec()
    .then(async (ads) => {
      // res.json(ads[0].happy);
      if (ads[0].happy.length === 0) {
        return next(
          new ErrorResponse(`You dont have set and happy to this ads`, 400)
        );
      } else {
        await ads[0].updateOne({ $pull: { happy: req.user.id } });
      }
    })
    .catch((err) => {
      return next(
        new ErrorResponse(`Ads not found with id of ${req.params.adsid}`, 404)
      );
    });

  res.status(200).json({
    success: true,
  });
});

//Set New Verification Code for Brand
exports.createVerficationCode = asyncHandler(async (req, res, next) => {
  const ads1 = await Ads.findById(req.params.adsid)
    .populate("verficationCode")
    .select("verficationCode");

  if (!ads1) {
    return next(new ErrorResponse(`Ads id not found`, 404));
  }

  ads1.verficationCode.forEach((element) => {
    // console.log(element.user_ref);
    if (element.user_ref.toString() === req.user.id.toString()) {
      return next(
        new ErrorResponse(
          `You Already Havve a verfication Code ${element.code}`,
          400
        )
      );
    }
  });

  // const newads = JSON.stringify(ads)
  // let NAds = ads;
  // NAds = JSON.stringify(NAds);
  // NAds = JSON.parse(NAds);
  // for (let i = 0; i < NAds.length; i++) {
  //   NAds[i]["happyCount"] = NAds[i].happy.length;
  //   NAds[i]["adsViews"] = NAds[i].views.length;
  //   for (let j = 0; j < NAds[i].happy.length; j++) {
  //     if (NAds[i].happy[j].toString() === req.user.id.toString()) {
  //       NAds[i]["isHappy"] = true;
  //       break;
  //     }
  //   }
  //   NAds[i]["happy"] = [];
  //   NAds[i]["views"] = [];
  // }

  let verfication, code;
  do {
    code = getRandomString(6);
    const verficationCode = await VerficationAds.find().where("code").in(code);
    if (verficationCode.length === 0) {
      verfication = false;
      // console.log(verfication);
    } else {
      verfication = true;
      // console.log(verfication);
    }
  } while (verfication);
  const creteNewVerfication = await VerficationAds.create({
    code,
    ads_ref: req.params.adsid,
    user_ref: req.user.id,
  });
  if (!creteNewVerfication) {
    return next(
      new ErrorResponse(`Ads not found with id of ${req.params.adsid}`)
    );
  }
  const user = await UserVerfication.findByIdAndUpdate(req.user.id, {
    $push: { ads_user: creteNewVerfication._id },
  });
  const ads = await Ads.findByIdAndUpdate(req.params.adsid, {
    $push: { verficationCode: creteNewVerfication._id },
  });

  if (!user || !ads) {
    return next(new ErrorResponse(`User or Ads id is not found`, 404));
  }

  res.status(201).json({
    success: true,
    data: creteNewVerfication,
  });
});

//Get Token From Module , Create Cookie and send Response
const sendTokenResponse = (user, statusCode, res) => {
  //Create Token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};

//Function to Verfication Code
function getRandomString(length) {
  var randomChars = "0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

exports.setRateforBrand = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid, {
    rateuser: { $elemMatch: { _id: { $in: `${req.user._id}` } } },
  });

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.brandid}`, 404)
    );
  }

  if (brand[0].rateuser.length !== 0) {
    return next(
      new ErrorResponse(`cant add another rate you actually have rate`, 404)
    );
  } else {
    // res.json(req.user)
    const rate = req.body.rate;
    const _id = req.user._id;

    const brand1 = await Brand.findByIdAndUpdate(req.params.brandid, {
      $push: {
        rateuser: {
          _id: _id,
          rate: rate,
        },
      },
    });

    res.status(201).json({
      success: true,
      data: brand1,
    });
  }
});

exports.getBrandByUser = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid, {
    rateuser: { $elemMatch: { _id: { $in: `${req.user._id}` } } },
  }).select("-rateruser");

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id ${req.params.brandid}`)
    );
  }

  res.status(200).json({
    sucess: true,
    data: brand,
  });
});

exports.updateUserRate = asyncHandler(async (req, res, next) => {
  const brand = await Brand.findById(req.params.brandid, {
    rateuser: { $elemMatch: { _id: { $in: `${req.user._id}` } } },
  });

  if (!brand) {
    return next(
      new ErrorResponse(`Brand not found with id of ${req.params.brandid}`, 404)
    );
  }

  if (brand[0].rateuser.length !== 0) {
    const rate = req.body.rate;
    const _id = req.user._id;

    const brand = await Brand.findOneAndUpdate(
      {
        _id: req.params.brandid,
        rateuser: { $elemMatch: { _id: { $eq: `${_id}` } } },
      },
      {
        $set: { "rateuser.$.rate": rate },
      }
    );

    if (!brand) {
      return next(
        new ErrorResponse(`Brand not found with id ${req.params.brandid}`, 404)
      );
    }

    res.status(201).json({
      success: true,
      data: brand,
    });
  } else {
    return next(new ErrorResponse(`You don't have any rate to updated`, 404));
  }
});

//---------------------------------------- Search Result For Brand ----------------------------------------
exports.getBrandSearch = asyncHandler(async (req, res, next) => {
  const brand = await User.findById(req.user._id)
    .select("historySearch")
    // .populate("historySearch", "name_en name_ar logo");
    .populate({
      path: "historySearch",
      select: "name_en name_ar logo categoryid",
      populate: {
        path: "categoryid",
        select: "name_en name_ar",
      },
    });

  res.status(200).json({
    success: true,
    data: brand,
  });
});

exports.setBrandSearch = asyncHandler(async (req, res, next) => {
  const brand = await User.findByIdAndUpdate(req.user._id, {
    // $push: { historySearch: req.params.brandid },
    $addToSet: { historySearch: req.params.brandid },
  });

  res.status(201).json({
    success: true,
  });
});

exports.deleteBrandSearch = asyncHandler(async (req, res, next) => {
  const brand = await User.findByIdAndUpdate(req.user._id, {
    $pull: { historySearch: req.params.brandid },
  });

  res.status(201).json({
    success: true,
  });
});

//---------------------------------------- Push Notification ----------------------------------------

exports.pushUserNotification = asyncHandler(async (req, res, next) => {
  const { typeOfNotification, refId, photoUrl, brandId } = req.body;
  const user = await User.findByIdAndUpdate(req.user._id, {
    $push: {
      notification: {
        typeOfNotification: typeOfNotification,
        id: id,
      },
    },
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getUserNotification = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("notification");

  user.notification.forEach(async (element) => {
    var typeOfNotification = element.typeOfNotification;
    if (typeOfNotification === "ads") {
      const ads = await Ads.findById(element.id);
      console.log(ads);
    } else if (typeOfNotification === "points") {
    }
  });
  res.status(200).json({
    success: true,
    data: user,
  });
});

exports.getMyIntrestedBrand = asyncHandler(async (req, res, next) => {
  const intrestedUserBrand = await User.findById(req.user._id)
    .select("interestedBrand")
    .populate({
      path: "interestedBrand",
      select: "logo name_en name_ar categoryid",
      populate: {
        path: "categoryid",
        select: "name_en name_ar",
      },
    });

  res.json({
    success: true,
    data: intrestedUserBrand.interestedBrand,
  });
});

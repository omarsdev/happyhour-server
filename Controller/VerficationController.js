const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const Gift = require("../model/Gift");
const Ads = require("../model/Ads");
const Store = require("../model/Store");

const {
  VerficationAds,
  VerficationGift,
  VerficationStore,
} = require("../model/Verfication");
const UserVerfication = require("../model/UserVerfication");
const { type } = require("os");
const UBPoints = require("../model/UBPoints");
const Casher = require("../model/Casher");

const { sendNotification } = require("../utils/sendNotification");
const { Client } = require("../model/Client");

exports.createVerficationCodeGift = asyncHandler(async (req, res, next) => {
  const giftid = req.params.giftid;
  const { quantity } = req.body;

  const gift = await Gift.findById(giftid)
    .select("verficationCode brand quantity")
    .populate("verficationCode");

  // console.log(gift);
  if (gift.quantity < quantity) {
    return next(
      new ErrorResponse(
        `The quantity that the user want is greater than the quantity that you Want `,
        400
      )
    );
  }

  if (!gift) {
    return next(new ErrorResponse(`Gift not foud with id of ${giftid}`));
  }

  const checkUserAccount = await UserVerfication.findById(req.user._id);
  if (!checkUserAccount) {
    return next(
      new ErrorResponse(`You Dont Have Any Points or cards to git gift`)
    );
  }

  let isUserVerficationFind = false;
  let userVerficationIndex = null;
  gift.verficationCode.forEach((element, index) => {
    if (element.user_ref.toString() === req.user.id.toString()) {
      isUserVerficationFind = true;
      userVerficationIndex = index;
    }
  });

  if (isUserVerficationFind) {
    return next(
      new ErrorResponse(
        `You Already Have a verfication Code ${gift.verficationCode[userVerficationIndex].code}`,
        400
      )
    );
  }

  let verfication, code;
  do {
    code = getRandomString(6);
    const verficationCode = await VerficationGift.find().where("code").in(code);
    if (verficationCode.length === 0) {
      verfication = false;
    } else {
      verfication = true;
    }
  } while (verfication);

  const creteNewVerfication = await VerficationGift.create({
    code,
    gift_ref: giftid,
    user_ref: req.user.id,
    brand_ref: gift.brand,
    quantity,
  });

  const user = await UserVerfication.findByIdAndUpdate(req.user.id, {
    $push: { gift_user: creteNewVerfication._id },
  });

  if (!user) {
    return next(
      new ErrorResponse(`You Dont Have Points or Cards on This Brnad`, 400)
    );
  }

  const giftVerfication = await Gift.findByIdAndUpdate(giftid, {
    $push: { verficationCode: creteNewVerfication._id },
  });

  res.status(200).json({
    success: gift,
    data: creteNewVerfication,
  });

  // gift.verficationCode.forEach((element) => {
  //   if (element.user_ref.toString() === req.user.id.toString()) {
  //     return next(
  //       new ErrorResponse(
  //         `You Already Havve a verfication Code ${element.code}`,
  //         400
  //       )
  //     );
  //   }
  // });

  // const user = await UserVerfication.findByIdAndUpdate(req.user.id, {
  //   $push: { gift_user: creteNewVerfication._id },
  // });
  // if (!user) {
  //   await VerficationGift.findByIdAndDelete(creteNewVerfication._id);
  //   return next(
  //     new ErrorResponse(`Please try to create verficationcode again 1`, 400)
  //   );
  // }
  // const giftVerfication = await Gift.findByIdAndUpdate(giftid, {
  //   $push: { verficationCode: creteNewVerfication._id },
  // });
  // if (!giftVerfication) {
  //   await VerficationGift.findByIdAndDelete(creteNewVerfication._id);
  //   await UserVerfication.findByIdAndUpdate(req.user.id, {
  //     $pull: { gift_user: creteNewVerfication._id },
  //   });
  //   return next(
  //     new ErrorResponse(`Please try to create verficationcode again`, 400)
  //   );
  // }

  // res.status(200).json({
  //   success: true,
  //   // data: creteNewVerfication,
  // });
});

function getRandomString(length) {
  var randomChars = "abcdefghijklmnopqrstuvwsyz";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

exports.createVerficationCodeStore = asyncHandler(async (req, res, next) => {
  // await UserVerfication.create({ _id: req.user._id });
  const storeid = req.params.storeid;
  const store = await Store.findById(storeid)
    .select("verficationCode brand")
    .populate("verficationCode");

  if (!store) {
    return next(new ErrorResponse(`Store not foud with id of ${storeid}`));
  }

  let isUserVerficationFind = false;
  let userVerficationIndex = null;
  store.verficationCode.forEach((element, index) => {
    if (element.user_ref.toString() === req.user.id.toString()) {
      isUserVerficationFind = true;
      userVerficationIndex = index;
    }
  });

  if (isUserVerficationFind) {
    return next(
      new ErrorResponse(
        `You Already Have a verfication Code ${store.verficationCode[userVerficationIndex].code}`,
        400
      )
    );
  }

  let verfication, code;
  do {
    code = getRandomCodeStore();
    const verficationCode = await VerficationStore.find()
      .where("code")
      .in(code);
    if (verficationCode.length === 0) {
      verfication = false;
    } else {
      verfication = true;
    }
  } while (verfication);

  const creteNewVerfication = await VerficationStore.create({
    code,
    store_ref: storeid,
    user_ref: req.user.id,
    brand_ref: store.brand,
  });
  if (!creteNewVerfication) {
    return next(new ErrorResponse(`Store not found with id of ${storeid}`));
  }

  const user = await UserVerfication.findByIdAndUpdate(req.user.id, {
    $push: { store_user: creteNewVerfication._id },
  });
  if (!user) {
    await VerficationStore.findByIdAndDelete(creteNewVerfication._id);

    return next(
      new ErrorResponse(`Please try to create verfication code again 1`, 400)
    );
  }
  const storeVerfication = await Store.findByIdAndUpdate(storeid, {
    $push: { verficationCode: creteNewVerfication._id },
  });
  if (!storeVerfication) {
    await VerficationStore.findByIdAndDelete(creteNewVerfication._id);
    await UserVerfication.findByIdAndUpdate(req.user.id, {
      $pull: { store_user: creteNewVerfication._id },
    });
    return next(
      new ErrorResponse(`Please try to create verfication code again`, 400)
    );
  }

  res.status(200).json({
    success: true,
    data: creteNewVerfication,
  });
});
function getRandomCodeStore() {
  var randomChars = "abcdefghijklmnopqrstuvwsyz";
  var randomNumber = "1234567890";
  var result = "";
  for (var i = 0; i < 3; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
    result += randomNumber.charAt(
      Math.floor(Math.random() * randomNumber.length)
    );
  }
  return result;
}

//ADS
exports.createVerficationCodeADS = asyncHandler(async (req, res, next) => {
  const adsid = req.params.adsid;
  const ads = await Ads.findById(adsid)
    .select("verficationCode brand")
    .populate("verficationCode");

  if (!ads) {
    return next(new ErrorResponse(`Ads id not found`, 404));
  }

  // console.log(ads);

  ads.verficationCode.forEach((element) => {
    // console.log(element.user_ref);
    if (element.user_ref.toString() === req.user.id.toString()) {
      return next(
        new ErrorResponse(
          `You Already Have a verfication Code ${element.code}`,
          400
        )
      );
    }
  });

  let verfication, code;
  do {
    code = getRandomStringADS(6);
    const verficationCode = await VerficationAds.find().where("code").in(code);
    if (verficationCode.length === 0) {
      verfication = false;
    } else {
      verfication = true;
    }
  } while (verfication);
  const creteNewVerfication = await VerficationAds.create({
    code,
    ads_ref: adsid,
    user_ref: req.user.id,
    brand_ref: ads.brand,
  });

  if (!creteNewVerfication) {
    return next(new ErrorResponse(`Ads not found with id of ${adsid}`));
  }

  const user = await UserVerfication.findByIdAndUpdate(req.user.id, {
    $push: { ads_user: creteNewVerfication._id },
  });
  const ads1 = await Ads.findByIdAndUpdate(req.params.adsid, {
    $push: { verficationCode: creteNewVerfication._id },
  });

  if (!user || !ads1) {
    return next(new ErrorResponse(`User or Ads id is not found`, 404));
  }

  res.status(201).json({
    success: true,
    data: creteNewVerfication,
  });
});

//Function to Verfication Code
function getRandomStringADS(length) {
  var randomChars = "0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

exports.checkVerficationCode = asyncHandler(async (req, res, next) => {
  const str = req.body.code;
  const brnadId = req.params.brnadId;
  var user_id;
  // console.log(req.body);

  //check type of code
  var x;
  var type;
  var chars = 0;
  var nums = 0;
  for (let i = 0; i < str.length; i++) {
    if (isNumeric(str.charAt(i))) {
      nums++;
    } else {
      chars++;
    }
  }

  var f = false;
  if (chars == 0 && nums != 0) {
    type = "offer";
    x = await VerficationAds.findOne({
      brand_id: req.body.brand_id,
      code: str,
    })
      .populate({
        path: "ads_ref",
        select: "price_on_card price_in_points adsPointHappyHour photo",
      })
      .populate({
        path: "user_ref",
        select: "notificationToken username email gender photo",
      });
    // console.log(x);
    if (x) {
      f = true;
      user_id = x.user_id;
    } else {
      return next(new ErrorResponse(`code is invalid`, 400));
    }
    if (x.expire) {
      return next(new ErrorResponse(`Code is already Expire`, 400));
    }
  }
  if (chars != 0 && nums == 0) {
    type = "gift";
    x = await VerficationGift.findOne({
      brand_id: req.body.brand_id,
      code: str,
    })
      .populate({
        path: "gift_ref",
        select: "price_in_points price_on_card photo",
      })
      .populate({
        path: "user_ref",
        select: "notificationToken username email gender photo",
      });
    // console.log("gift");
    if (x) {
      f = true;
      user_id = x.user_id;
    } else {
      return next(new ErrorResponse(`code is invalid`, 400));
    }
    if (x.expire) {
      return next(new ErrorResponse(`Code is already Expire`, 400));
    }
  }
  if (chars != 0 && nums != 0) {
    type = "store";
    x = await VerficationStore.findOne({
      brand_id: req.body.brand_id,
      code: str,
    })
      .populate({
        path: "store_ref",
        select: "priceInCard priceInPoints product",
      })
      .populate({
        path: "user_ref",
        select: "notificationToken username email gender photo",
      });
    // console.log("store");
    if (x) {
      f = true;
      user_id = x.user_id;
    } else {
      return next(new ErrorResponse(`code is invalid`, 400));
    }
    if (x.expire) {
      return next(new ErrorResponse(`Code is already Expire`, 400));
    }
  }

  if (!f) {
    res.status(200).json({
      success: false,
      msg: "Code is wrong",
    });
  } else {
    res.status(200).json({
      success: true,
      data: x,
    });
  }
});

exports.checkCode = asyncHandler(async (req, res, next) => {
  //check code if ads or store or gift
  const str = req.body.code;
  const brnadId = req.params.brnadId;
  var user_id;

  //check type of code
  var x;
  var type;
  var chars = 0;
  var nums = 0;
  for (let i = 0; i < str.length; i++) {
    if (isNumeric(str.charAt(i))) {
      nums++;
    } else {
      chars++;
    }
  }

  var f = false;
  if (chars == 0 && nums != 0) {
    type = "offer";
    x = await VerficationAds.findOne({
      brand_id: req.body.brand_id,
      code: str,
    })
      .populate({
        path: "ads_ref",
        select: "price_on_card price_in_points adsPointHappyHour photo",
      })
      .populate({
        path: "user_ref",
        select: "notificationToken",
      });
    console.log(x);
    if (x) {
      f = true;
      user_id = x.user_id;
    }
    if (x.expire) {
      return next(new ErrorResponse(`Code is already Expire`, 400));
    }
  }
  if (chars != 0 && nums == 0) {
    type = "gift";
    x = await VerficationGift.findOne({
      brand_id: req.body.brand_id,
      code: str,
    })
      .populate({
        path: "gift_ref",
        select: "price_in_points price_on_card photo",
      })
      .populate({
        path: "user_ref",
        select: "notificationToken",
      });
    // console.log("gift");
    if (x) {
      f = true;
      user_id = x.user_id;
    }
    if (x.expire) {
      return next(new ErrorResponse(`Code is already Expire`, 400));
    }
  }
  if (chars != 0 && nums != 0) {
    type = "store";
    x = await VerficationStore.findOne({
      brand_id: req.body.brand_id,
      code: str,
    })
      .populate({
        path: "store_ref",
        select: "priceInCard priceInPoints product",
      })
      .populate({
        path: "user_ref",
        select: "notificationToken",
      });
    // console.log("store");
    if (x) {
      f = true;
      user_id = x.user_id;
    }
    if (x.expire) {
      return next(new ErrorResponse(`Code is already Expire`, 400));
    }
  }

  if (!f) {
    res.status(200).json({
      success: false,
      msg: "Code is wrong",
    });
  } else {
    // if Type is gift then check if there is any ponts to buy this gift
    if (type === "gift") {
      const ub = await UBPoints.findOne({
        user_id: user_id,
        brand_id: brnadId,
      });
      //if User Dont Have Account in User Brnad Points
      if (!ub) {
        res.json({
          success: true,
          msg: "the User dones not has any points in his account",
        });
      }
      //if User Has a Account in User Brand Poinst
      //gt gift price
      const priceGift =
        x.gift_ref.price_in_points + x.gift_ref.price_on_card * 100;
      const userPriceOwnerGift = ub.cards * 100 + ub.points;

      if (userPriceOwnerGift < priceGift) {
        return next(new ErrorResponse(`User Has Less Points Than Gift Price`));
      } else {
        const result = userPriceOwnerGift - priceGift;
        const newUserGiftCards = result / 100;
        const newUserGiftPoints = result % 100;
        //update user Brand Poinst
        //add to logs that user get his gift
        const description = `${str} has been vrfiyed and ${priceGift} points has been taken from your account`;
        await UBPoints.findByIdAndUpdate(ub._id, {
          cards: newUserGiftCards,
          points: newUserGiftPoints,
          $push: { logs: { desc: description } },
        });
        //update the code to expire
        await VerficationGift.findByIdAndUpdate(x._id, {
          expire: true,
          used_at: Date.now(),
        });
        //Update Cahser Logs
        if (req.user.role === "casher") {
          await Casher.findByIdAndUpdate(req.user._id, {
            $push: {
              gift_log: {
                msg: `You Verfiyd New Gift Code`,
                code: str,
              },
            },
          });
        } else {
          await Client.findByIdAndUpdate(req.user._id, {
            $push: {
              gift_log: {
                msg: `You Verfiyd New Gift Code`,
                code: str,
              },
            },
          });
        }

        //send notification that the gift has benn verfiyed
        await sendNotification(
          x.user_ref.notificationToken,
          "Gift Verfiyed",
          "You Have Benn Confirm Your Verfication Code",
          x.gift_ref.photo
        );
        res.json({
          success: true,
        });
        //TODO check quantity for user
      }
    }
    //if Type is Ads or Store
    else if (type === "offer") {
      const ub = await UBPoints.findOne({
        user_id: user_id,
        brand_id: brnadId,
      });
      const priceOffer =
        Number(x.ads_ref.price_on_card) * 100 +
        Number(x.ads_ref.price_in_points);

      // console.log(
      //   "------------------------------------------------------------------------------------",
      //   ub
      // );
      //if User Dont Have Account in User Brnad Points
      if (!ub) {
        // console.log("ONEEEEEEEEEEE");
        await UBPoints.create({
          user_id: user_id,
          brand_id: brnadId,
          points: Number(x.ads_ref.price_in_points),
          cards: Number(x.ads_ref.price_on_card),
          logs: [{ desc: "You Have Benn Buy New product from Offer Service" }],
        });
      } else {
        const userPriceOwnerOffer = Number(ub.cards) * 100 + Number(ub.points);

        const resultPointsUserBrnad =
          Number(priceOffer) + Number(userPriceOwnerOffer);

        const userBrandsCards = resultPointsUserBrnad / 100;
        const userBrandsPoints = resultPointsUserBrnad % 100;
        await UBPoints.findByIdAndUpdate(ub._id, {
          points: userBrandsPoints,
          cards: userBrandsCards,
          $push: {
            logs: { desc: "You Have Benn Buy New product from Offer Service" },
          },
        });
      }
      await VerficationAds.findByIdAndUpdate(x._id, {
        expire: true,
        used_at: Date.now(),
      });

      if (req.user.role === "casher") {
        await Casher.findByIdAndUpdate(req.user._id, {
          $push: {
            ads_log: {
              msg: `You Verfiyd New Offer Code`,
              code: str,
            },
          },
        });
      } else {
        await Client.findByIdAndUpdate(req.user._id, {
          $push: {
            ads_log: {
              msg: `You Verfiyd New Offer Code`,
              code: str,
            },
          },
        });
      }

      //send notification that the gift has benn verfiyed
      await sendNotification(
        x.user_ref.notificationToken,
        "Ads Verfiyed",
        "You Have Benn Confirm Your Verfication Code",
        x.ads_ref.photo[0]
      );

      res.json({
        success: true,
      });
    }
    //if type is Store
    else if (type === "store") {
      const ub = await UBPoints.findOne({
        user_id: user_id,
        brand_id: brnadId,
      });
      const priceOffer =
        Number(x.store_ref.priceInCard) * 100 +
        Number(x.store_ref.priceInPoints);

      if (!ub) {
        await UBPoints.create({
          user_id: user_id,
          brand_id: brnadId,
          points: Number(x.store_ref.priceInPoints),
          cards: Number(x.store_ref.priceInCard),
          logs: [{ desc: "You Have Benn Buy New product from Offer Service" }],
        });
      } else {
        const userPriceOwnerOffer = Number(ub.cards) * 100 + Number(ub.points);

        const resultPointsUserBrnad =
          Number(priceOffer) + Number(userPriceOwnerOffer);

        const userBrandsCards = resultPointsUserBrnad / 100;
        const userBrandsPoints = resultPointsUserBrnad % 100;
        await UBPoints.findByIdAndUpdate(ub._id, {
          points: userBrandsPoints,
          cards: userBrandsCards,
          $push: {
            logs: { desc: "You Have Benn Buy New product from Offer Service" },
          },
        });
      }
      await VerficationStore.findByIdAndUpdate(x._id, {
        expire: true,
        used_at: Date.now(),
      });

      if (req.user.role === "casher") {
        await Casher.findByIdAndUpdate(req.user._id, {
          $push: {
            store_log: {
              msg: `You Verfiyd New Offer Code`,
              code: str,
            },
          },
        });
      } else {
        await Client.findByIdAndUpdate(req.user._id, {
          $push: {
            store_log: {
              msg: `You Verfiyd New Offer Code`,
              code: str,
            },
          },
        });
      }

      //send notification that the gift has benn verfiyed
      await sendNotification(
        x.user_ref.notificationToken,
        "Ads Verfiyed",
        "You Have Benn Confirm Your Verfication Code",
        x.store_ref.product[0].photo[0]
      );

      res.json({
        success: true,
      });
    }
  }
});

function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

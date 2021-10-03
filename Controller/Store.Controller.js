const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { Brand } = require("../model/Brand");
const { Client } = require("../model/Client");
const Store = require("../model/Store");
const sharp = require("sharp");

const multer = require("multer");
const { json } = require("express");

const StoreRate = require("../model/StoreRate");

//get All Store for this brand
exports.getAllStore = asyncHandler(async (req, res, next) => {
  const brandStore = await Brand.findById(req.params.brandid)
    .select("storeid")
    .populate({
      path: "storeid",
      options: { sort: { created_at: -1 } },
      // select: "-Rate",
      populate: {
        path: "subCategory verficationCode itemType",
        // select: "name_en name_ar",
      },
      // populate: {
      //   path: "verficationCode",
      // },
    });
  // .sort({ created_at: 1 });

  const store = JSON.parse(JSON.stringify(brandStore.storeid));

  store.forEach((element, index) => {
    element.product.forEach((element, index1) => {
      element.photo.forEach((element, index2) => {
        store[index].product[index1].photo[index2] =
          process.env.CURRENT_PATH + element;
      });
    });

    let isLikeFound = false;
    let isIWantThisFound = false;
    element.happy.forEach((e, i) => {
      if (e.toString() === req.user._id.toString()) {
        isLikeFound = true;
      }
    });
    element.iwantthis.forEach((e, i) => {
      if (e.toString() === req.user._id.toString()) {
        isIWantThisFound = true;
      }
    });

    let userCode = null;
    let userCodeExpire = null;
    element.verficationCode.forEach((element, index) => {
      if (element.user_ref.toString() === req.user._id.toString()) {
        userCode = element.code;
        userCodeExpire = element.expire;
      }
    });

    let rateUserIndex = null;
    element.Rate.forEach((e, i) => {
      if (e.user_ref.toString() === req.user._id.toString()) {
        rateUserIndex = i;
      }
    });

    element["happyCount"] = element.happy.length;
    element["iwantthisCount"] = element.iwantthis.length;
    element["isUserLiked"] = isLikeFound;
    element["isUserIWantThis"] = isIWantThisFound;
    element["userCode"] = userCode;
    element["userCodeExpire"] = userCodeExpire;
    element["userRate"] = element.Rate[rateUserIndex];

    delete element.happy;
    delete element.iwantthis;
    delete element.verficationCode;
    delete element.Rate;
  });

  if (!brandStore) {
    return next(
      new ErrorResponse(`brand not found with id of ${req.params.brandid}`)
    );
  }

  res.json({
    success: true,
    count: brandStore.storeid.length,
    data: store,
  });
});

exports.checkStoreTest = asyncHandler(async (req, res, next) => {
  //check client if owner of the brand
  const brand = await Brand.findById(req.params.brandid)
    .where("clientid")
    .in(req.user._id);

  if (!brand) {
    return next(new ErrorResponse(`Brand not found`, 404));
  }
  //ceck if there is any photo
  if (!req.files.photo) {
    return next(new ErrorResponse(`please upload a photo`, 400));
  }
  //check if there is any daat missing
  // const data = JSON.parse(req.body.data);
  const {
    description,
    priceInCard,
    priceInPoints,
    subCategory,
    itemType,
    productPrice,
  } = req.body;
  const product = JSON.parse(req.body.product);
  // console.log(data);
  if (
    description === undefined ||
    priceInCard === undefined ||
    priceInPoints === undefined ||
    subCategory === undefined ||
    itemType === undefined ||
    productPrice === undefined ||
    product.length === 0
  ) {
    return next(
      new ErrorResponse("Please add all fields missing information", 400)
    );
  }
  //check the sattus for all the photo
  const photo = req.files.photo;
  photo.forEach((element) => {
    if (!element.mimetype.startsWith("image")) {
      return next(new ErrorResponse(`Please upload an image file`, 400));
    }
    // Check filesize
    // if (element.size > process.env.MAX_FILE_UPLOAD) {
    //   return next(
    //     new ErrorResponse(
    //       `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
    //       400
    //     )
    //   );
    // }
  });

  const store = await Store.create({
    description: description,
    priceInCard: priceInCard,
    priceInPoints: priceInPoints,
    subCategory: subCategory,
    itemType: itemType,
    productPrice: productPrice,
    product: product,
    brand: req.params.brandid,
  });

  //create path for store
  const dir = store._id.toString();
  const storepath = `${process.env.FILE_UPLOAD_PATH_CLIENT}/${req.user._id}/${req.params.brandid}/store`;
  const finallPath = storepath.concat("/", dir);

  if (!fs.existsSync(finallPath)) {
    fs.mkdirSync(finallPath);
  }
  let x = 0;
  product.forEach((element) => {
    const colorName = element.color.substring(1);
    const finallColorPath = finallPath.concat("/", colorName);

    if (!fs.existsSync(finallColorPath)) {
      fs.mkdirSync(finallColorPath);
    }
    x += element.photo.length;
  });
  if (x !== photo.length) {
    return next(
      new ErrorResponse(
        `Please make sure to upload all photo some of your photo is missing`,
        400
      )
    );
  }

  product.forEach((element) => {
    let photoColorArray = [];
    element.photo.forEach((e, i) => {
      photo[Number(e)].name = `photo_${store._id}-${element.color.substring(
        1
      )}-${Number(e)}${path.parse(photo[Number(e)].name).ext}`;
      sharp(photo[Number(e)].data)
        .toFormat("jpg")
        .jpeg({ quality: 20 })
        .toFile(
          `${process.env.FILE_UPLOAD_PATH_CLIENT}/${req.user._id}/${
            req.params.brandid
          }/store/${store._id}/${element.color.substring(1)}/${
            photo[Number(e)].name
          }`
        );

      // photo[i].mv(
      //   `${process.env.FILE_UPLOAD_PATH_CLIENT}/${req.user._id}/${
      //     req.params.brandid
      //   }/store/${store._id}/${element.color.substring(1)}/${
      //     photo[Number(e)].name
      //   }`,
      //   async (err) => {
      //     if (err) {
      //       console.error(err);

      //       return next(new ErrorResponse(`Problem with file upload`, 500));
      //     }
      //   }
      // );

      photoColorArray.push(
        `${process.env.CLIENT}/${req.user._id}/${req.params.brandid}/store/${
          store._id
        }/${element.color.substring(1)}/${photo[Number(e)].name}`
      );
    });
    element.photo = photoColorArray;
  });

  const upladeBrand = await Brand.findByIdAndUpdate(req.params.brandid, {
    $push: {
      storeid: store._id,
    },
  });

  const replaceStore = await Store.findOneAndReplace(
    { _id: store._id },
    {
      description: description,
      priceInCard: priceInCard,
      priceInPoints: priceInPoints,
      subCategory: subCategory,
      itemType: itemType,
      productPrice: productPrice,
      product: product,
      brand: req.params.brandid,
    }
  );

  res.status(200).json({
    success: true,
    data: replaceStore,
  });

  //add each photo in spesific folder
  // console.log(element.photo);
  // element.photo.forEach(async (indexPhoto) => {
  //   // console.log(photo[Number(indexPhoto)]);
  //   if (!photo[Number(indexPhoto)]) {
  //     await Store.findByIdAndDelete(store._id);
  //     return next(new ErrorResponse(`Some Photo has been missing`, 400));
  //   } else {

  //   }

  //   // await store.updateOne({ photo: photo.name });
  //   // const brand = await Brand.findByIdAndUpdate(req.params.brandid, {
  //   //   $push: {
  //   //     storeid: store._id,
  //   //   },
  //   // });

  //   // if (!brand) {
  //   //   await Store.findByIdAndDelete(store._id);
  //   //   return next(new ErrorResponse(`Please tyy Again`, 500));
  //   // }

  //   // res.status(200).json({
  //   //   success: true,
  //   //   store,
  //   // });
  //   // }
  //   // );
  // }

  // const data =

  // const { description, color } = req.body;
  // console.log("Description is : ", description, "\nColor is : ", color);

  // color.forEach((e) => {
  //   console.log("type of color", e.type);
  // });

  // const store = await Store.create(req.body);

  // console.log(JSON.parse(req.body.data));

  // console.log(data);
  // data.product.forEach((element) => {
  //   console.log(element.color, element.photo);
  //   element.photo.forEach((e) => {
  //     // console.log(req.files.photo[Number(e)]);
  //   });
  // });
  // console.log(req.files.photo);

  // const store = await Store.create(req.body);

  // const { color, size } = req.body;

  // let size1 = JSON.parse(size);
  // size = size1;

  // let photo = [];

  // color.forEach((element) => {
  // console.log("type : ", element.type);
  // console.log("photo : ", element.photo.photoarray);
  // photo = element.photo.photoarray;
  // console.log("size : ", element.photo.size);
  // });

  // photo._parts.forEach((element) => {
  //   console.log(element);
  // });

  // res.status(200).json({
  //   success: true,
  //   // data: store,
  // });
});

exports.addHappyStore = asyncHandler(async (req, res, next) => {
  await Store.find(
    { _id: req.params.storeid },
    {
      happy: { $elemMatch: { $in: req.user._id } },
    }
  )
    .exec()
    .then(async (store) => {
      // res.json(ads[0].happy);
      if (store[0].happy.length !== 0) {
        return next(
          new ErrorResponse(`You alredy have a like on this Store`, 400)
        );
      } else {
        await store[0].updateOne({ $push: { happy: req.user.id } });
      }
    })
    .catch((err) => {
      return next(
        new ErrorResponse(`Ads not found with id of ${req.params.storeid}`, 404)
      );
    });

  res.status(200).json({
    success: true,
  });
});

exports.removeHappyStore = asyncHandler(async (req, res, next) => {
  await Store.find(
    { _id: req.params.storeid },
    {
      happy: { $elemMatch: { $in: req.user._id } },
    }
  )
    .exec()
    .then(async (store) => {
      // res.json(ads[0].happy);
      if (store[0].happy.length === 0) {
        return next(
          new ErrorResponse(`You dont have set and happy to this store`, 400)
        );
      } else {
        await store[0].updateOne({ $pull: { happy: req.user.id } });
      }
    })
    .catch((err) => {
      return next(
        new ErrorResponse(`Ads not found with id of ${req.params.storeid}`, 404)
      );
    });
  res.status(200).json({
    success: true,
  });
});

exports.addIWantThis = asyncHandler(async (req, res, next) => {
  await Store.find(
    { _id: req.params.storeid },
    {
      iwantthis: { $elemMatch: { $in: req.user._id } },
    }
  )
    .exec()
    .then(async (store) => {
      // res.json(ads[0].happy);
      if (store[0].iwantthis.length !== 0) {
        return next(
          new ErrorResponse(`You alredy have a i want this on this Store`, 400)
        );
      } else {
        await store[0].updateOne({ $push: { iwantthis: req.user.id } });
      }
    })
    .catch((err) => {
      return next(
        new ErrorResponse(`Ads not found with id of ${req.params.storeid}`, 404)
      );
    });

  res.status(200).json({
    success: true,
  });
});

exports.removeIWantThis = asyncHandler(async (req, res, next) => {
  await Store.find(
    { _id: req.params.storeid },
    {
      iwantthis: { $elemMatch: { $in: req.user._id } },
    }
  )
    .exec()
    .then(async (store) => {
      // res.json(ads[0].happy);
      if (store[0].iwantthis.length === 0) {
        return next(
          new ErrorResponse(
            `You dont have set and i want this to this store`,
            400
          )
        );
      } else {
        await store[0].updateOne({ $pull: { iwantthis: req.user.id } });
      }
    })
    .catch((err) => {
      return next(
        new ErrorResponse(`Ads not found with id of ${req.params.storeid}`, 404)
      );
    });
  res.status(200).json({
    success: true,
  });
});

exports.addUserRate = asyncHandler(async (req, res, next) => {
  const storeid = req.params.storeid;
  const { rate, comment } = req.body;

  if (rate < 0 || rate > 5) {
    return next(
      new ErrorResponse(`Your rate must be between 0 and 5 only`, 400)
    );
  }

  const userRate = await Store.findOneAndUpdate({
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
  const userRate1 = await Store.findOneAndUpdate({
    rateAvg: RateAvg,
  });

  res.status(201).json({
    success: true,
  });
});

exports.getAverageRate = asyncHandler(async (req, res, next) => {
  // const rate = await Store.aggregate([
  //   { $match: { _id: req.params.storeid } },
  //   // {
  //   //   $group: {
  //   //     _id: "$_id",
  //   //     // averageCost: { $avg: "$Rate" },
  //   //   },
  //   // },
  // ]);

  // console.log(rate);

  const rate = await Store.aggregate([
    { $match: { _id: req.params.storeid } },
    {
      $project: {
        MarksAvg: {
          $sum: "$Marks",
        },
      },
    },
  ]);

  res.json({
    success: true,
    data: rate,
  });
});

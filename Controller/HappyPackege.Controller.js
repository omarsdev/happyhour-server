const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const { AdsPackege, HappyPackege } = require("../model/Packege");

//----------------------------Happy Hour packege----------------------------
exports.createPackege = asyncHandler(async (req, res, next) => {
  const { numberOfHour, totalPrice } = req.body;
  const packege = await HappyPackege.find()
    .where("numberOfHour")
    .in(numberOfHour);

  if (packege.length !== 0) {
    return next(
      new ErrorResponse(`You can Cretae Packege is Already Ther`),
      400
    );
  }

  const createPackege = await HappyPackege.create({
    numberOfHour,
    totalPrice,
  });

  res.status(201).json({
    sucess: true,
    data: createPackege,
  });
});

exports.getPackege = asyncHandler(async (req, res, next) => {
//   const { numberOfHour } = req.body;
  const packege = await HappyPackege.find()
    // .where("numberOfHour")
    // .in(numberOfHour);

  res.status(200).json({
    sucess: true,
    data: packege,
  });
});

//----------------------------ADS packege----------------------------

exports.createPackegeAds = asyncHandler(async (req, res, next) => {
    const {from, to, totalDiscount} = req.body
    let list = []
    for (let i = from; i < to; i += 5) {
        list.push(i)
    }
  const packege = await AdsPackege.create({
    adsDiscount: list,
    totalDiscount,
  });

  res.status(201).json({
    success: true,
    data: packege,
  });
});

exports.getPackegeAds = asyncHandler(async (req, res, next) => {
    const packege =  await AdsPackege.find();

    res.status(200).json({
        success: true,
        data: packege,
      });
})

const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const { Client, Payment } = require("../model/Client");
const Brand = require("../model/Brand");
const Ads = require("../model/Ads");
const { HappyPackege, AdsPackege } = require("../model/Packege");
const PaymentAccount = require("../model/PaymentAccount");
const User = require("../model/User");

//-----------------------------Client-----------------------------
// @desc      Get Clients
// @route     GET /api/v1/client/get
// @route     GET /api/v1/client/get
// @access    Public
exports.getClients = asyncHandler(async (req, res, next) => {
  const client = await Client.find().populate("_id");

  res.status(200).json({
    success: true,
    count: client.length,
    data: client,
  });
});

exports.getClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id).populate("userid");

  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: client,
  });
});

exports.crateClient = asyncHandler(async (req, res, next) => {
  const { telephone_number, email, date_created_company } = req.body;
  const client = await Client.create({
    _id: req.user._id,
    telephone_number,
    email,
    date_created_company,
  });
  if (!client) {
    return next(new ErrorResponse(`Please try again`, 400));
  }
  const user = await User.findByIdAndUpdate(req.user._id, {
    role: "client",
  });

  if (!user) {
    return next(new ErrorResponse(`User Not found`, 404));
  }

  let dir = client._id.toString();
  let dir2 = path.normalize(process.env.FILE_UPLOAD_PATH_CLIENT);
  const di3 = dir2.concat("/", dir);
  if (!fs.existsSync(di3)) {
    fs.mkdirSync(di3, { recursive: true }, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("New directory successfully created.");
      }
    });
  }
  res.status(201).json({
    success: true,
    data: client,
  });
});

//-----------------------------Payment-----------------------------

exports.getPayment = asyncHandler(async (req, res, next) => {
  const clientid = req.params.clientid;
  const client = await User.findById(clientid)
    .where("role")
    .in("client")
    .select("payment")
    .populate("payment");
  if (!client) {
    return next(
      new ErrorResponse(`Client not found with id of ${clientid}`, 404)
    );
  }
  res.status(200).json({
    success: true,
    count: client.length,
    data: client,
  });
});

exports.createPayment = asyncHandler(async (req, res, next) => {
  const clientid = req.params.clientid;
  const { amount_received, number_of_hour, from, to } = req.body;
  const client = await PaymentAccount.find()
    .where("client")
    .in(req.params.clientid);
  if (client.length === 0) {
    return next(
      new ErrorResponse(
        `Client not found with id of ${clientid} or his not client`,
        404
      )
    );
  }

  const findPricePackege = await HappyPackege.find()
    .where("numberOfHour")
    .in(number_of_hour);

  if (findPricePackege.length === 0) {
    return next(
      new ErrorResponse(`There is no packege for ${number_of_hour} hour`, 404)
    );
  }

  if (amount_received !== findPricePackege[0].totalPrice) {
    return next(
      new ErrorResponse(
        `The price is not enouph , actual price is ${findPricePackege[0].totalPrice}`,
        406
      )
    );
  }

  const paymentNumber = client[0].payment.length + 1;

  const CreatePayment = await Payment.create({
    amount_received: amount_received,
    payment_number: paymentNumber,
    employee_ref: req.employee.id,
  });
  if (!CreatePayment) {
    return next(new ErrorResponse(`Please Try Again`, 400));
  }
  const b = number_of_hour + client[0].hourLeft;
  const c = amount_received + client[0].balance;
  const updateClientPayment = await PaymentAccount.findByIdAndUpdate(
    client[0]._id,
    {
      $push: { payment: CreatePayment._id },
      hourLeft: b,
      balance: c,
    }
  );
  res.status(201).json({
    success: true,
    data: updateClientPayment,
  });

  // // const findPackege = await HappyPackege.find();

  // res.status(200).json({
  //   sucess: true,
  //   data: findPricePackege,
  // });
});

exports.checkEndAds = asyncHandler(async (req, res, next) => {
  const ads = await Ads.find();
  const c = ads[0].start_time;
  const start = "2021-02-15T20:05:00.000+00:00";
  const end = "2021-02-15T20:08:00.000+00:00";
  // console.log(end-start)
  console.log(c.toDateString());
  console.log(c.toTimeString());
});

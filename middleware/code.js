const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User");
const Employee = require("../model/Employee");
const { Client } = require("../model/Client");
const Casher = require("../model/Casher");


exports.checkCode = asyncHandler(async (req, res, next) => {
    if (!req.params.brandid || !req.params.branchid) {
      return next(new ErrorResponse("Add Branch And Brand", 400));
    }
    try {
      if (req.user.role === "client") {
        const client = await Client.findById(req.user._id)
          .select("brand")
          .populate({
            path: "brand",
            select: "branche",
          });
        if (!client) {
          return next(new ErrorResponse(`Client not found`, 400));
        }
        client.brand.forEach((element, index) => {
          if (element._id.toString() === req.params.brandid) {
            client.brand[index].branche.forEach((branchID, index) => {
              if (branchID.toString() === req.params.branchid.toString()) {
                //TODO
                req.whoami = "client";
                next();
              } else if (client.brand[index].branche.length - 1 === index) {
                return next(new ErrorResponse(`Branche not found`, 400));
              }
            });
          } else if (client.brand.length - 1 === index) {
            return next(new ErrorResponse(`Brand not found`, 400));
          }
        });
      } else if (req.user.role === "casher") {
        const casher = await Casher.findById(req.user._id);
        if (!casher) {
          return next(new ErrorResponse(`Casher not found`, 400));
        }
        if (casher.brandId.toString() === req.params.brandid.toString()) {
          casher.branchId.forEach((element, index) => {
            if (element.toString() === req.params.branchid.toString()) {
              //TODO
              req.whoami = "casher";
              next();
            } else if (casher.branchId.length - 1 === index) {
              return next(new ErrorResponse(`Branche not found`, 400));
            }
          });
        } else {
          return next(new ErrorResponse(`Brand not found`, 400));
        }
      }
    } catch (error) {
      return next(new ErrorResponse(`Not Autherize to access this route`, 401));
    }
  });
  
  exports.verfiyCode = asyncHandler(async (req, res, next) => {
    const str = req.body.code;
    if(req.body.code.length !== 6 ){
      return next(
        new ErrorResponse("invalid Code !!", 400)
      )
    }
    var x;
    let type;
    var chars = 0;
    var nums = 0;
    for (var i = 0; i < str.length; i++) {
      if (isNumeric(str.charAt(i))) {
        nums++;
      } else {
        chars++;
      }
    }
    // var f = false;
    if (chars == 0 && nums != 0) {
      req.codeStatus = 'Offer'
      // type = "offer";
      // x = await AdsVerification.find({ brand_id: req.body.brand_id });
      // x.forEach((element) => {
      //   element.vcode.forEach((e) => {
      //     if (e.code === str) {
      //       f = true;
      //       user_id = element.user_id;
      //     }
      //   });
      // });
    }
    else if (chars != 0 && nums == 0) {
      // res.json({
      //   type: "Gift",
      // });
      req.codeStatus = 'Gift'
      // type = "gift";
      // x = await GiftVerification.find({ brand_id: req.body.brand_id });
      // x.forEach((element) => {
      //   element.vcode.forEach((e) => {
      //     if (e.code === str) {
      //       f = true;
      //       user_id = element.user_id;
      //     }
      //   });
      // });
    }
    else if (chars != 0 && nums != 0) {
      // res.json({
      //   type: "Store",
      // });
      req.codeStatus = 'Store'
      // type = "store";
      // x = await StoreVerification.find({ brand_id: req.body.brand_id });
      // x.forEach((element) => {
      //   element.vcode.forEach((e) => {
      //     if (e.code === str) {
      //       f = true;
      //       user_id = element.user_id;
      //     }
      //   });
      // });
    }
  
    // if (!f) {
    //   res.status(200).json({
    //     success: false,
    //     msg: "Code is wrong",
    //   });
    // }
    next();
  })
  
  
  function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }
  
const jwt = require("jsonwebtoken");
const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User");
const Employee = require("../model/Employee");
const { Client } = require("../model/Client");
const Casher = require("../model/Casher");
//Produt routes

//we have to send token to create client account
exports.protect = asyncHandler(async (req, res, next) => {
  //take token
  let token;
  //check Headers autherization
  // if (
  //   req.headers.authorization &&
  //   req.headers.authorization.startsWith("Bearer")
  // ) {
  //   token = req.headers.authorization.split(" ")[1];
  // }
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  //Make Sure Token exists
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  //if token exists we need to verify
  try {
    //Verify Token
    //1 - extract the payload
    const decooded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decooded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

//prodect for Admin
exports.protectEmployee = asyncHandler(async (req, res, next) => {
  //take token
  let token;
  //check Headers autherization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  //Make Sure Token exists
  if (!token) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }

  try {
    //Verify Token
    //1 - extract the payload
    const decooded = jwt.verify(token, process.env.JWT_SECRET);

    req.employee = await Employee.findById(decooded.id);

    next();
  } catch (err) {
    return next(new ErrorResponse("Not authorize to access this route", 401));
  }
});

//User access to apecific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User Role ${req.user.role} is unautherized to access this routes`,
          401
        )
      );
    }
    next();
  };
};

//Employee access to apecific roles
exports.authorizeEmployee = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.employee.role)) {
      return next(
        new ErrorResponse(
          `Employee Role ${req.user.role} is unautherized to access this routes`,
          401
        )
      );
    }
    next();
  };
};

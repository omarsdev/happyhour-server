const asyncHandler = require("./async");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../model/User");

exports.pushNotificationUser = asyncHandler(async (req, res, next) => {
  // req.notification = await User.findById(req.user.i)
});

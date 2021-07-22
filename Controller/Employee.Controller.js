const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");

const Employee = require("../model/Employee");
const { Country, City } = require("../model/Address");

const { getCity } = require("../Controller/Address.Controller");

exports.getEmployees = asyncHandler(async (req, res, next) => {
  const employee = await Employee.find().where("delete_account").in(false);
  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
  });
});

exports.getEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id)
    .where("delete_account")
    .in(false);

  if (!employee) {
    return next(
      new ErrorResponse(`There is No Employee With ID of ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
  });
});

exports.getEmployeeDeleted = asyncHandler(async (req, res, next) => {
  const employee = await Employee.find().where("delete_account").in(true);

  res.status(200).json({
    success: true,
    count: employee.length,
    data: employee,
  });
});

exports.createEmployee = asyncHandler(async (req, res, next) => {
  const { country, city } = req.body;

  const countryCheck = await Country.findById(country)
    .select({ city: { $elemMatch: { $eq: city } } })
    .populate("city");
  if (!countryCheck) {
    return next(
      new ErrorResponse(`Country not found with id of ${country}`, 404)
    );
  }

  if (countryCheck.city.length === 0) {
    return next(new ErrorResponse(`City not found with id of ${city}`, 404));
  }

  const employee = await Employee.create(req.body);

  sendTokenResponse(employee, 200, res);
});

exports.updateEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!employee) {
    return next(
      new ErrorResponse(`There is No Employee With ID of ${req.params.id}`)
    );
  }
  res.status(200).json({
    success: true,
    data: employee,
  });
});

exports.employeePhotoUpload = asyncHandler(async (req, res, next) => {
  // const path = "../images/Employee/"
  // fs.readdirSync(path)
  // console.log(__dirname)
  // console.log(path.join(__dirname, '../images/Employee'));
});

exports.updateEmployeePhoto = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) {
    return next(
      new ErrorResponse(`Employee not found with id of ${req.params.id}`, 404)
    );
  }

  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }

  const file = req.files.employee;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith("image")) {
    return next(new ErrorResponse(`Please upload an image file`, 400));
  }

  // Check filesize
  // if (file.size > process.env.MAX_FILE_UPLOAD) {
  //   return next(
  //     new ErrorResponse(
  //       `Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`,
  //       400
  //     )
  //   );
  // }

  // Create custom filename
  file.name = `${employee.first_name}-${employee.last_name}_${employee._id}${
    path.parse(file.name).ext
  }`;

  // shrap file size
  // sharp(__dirname + '/images/avatar.jpg')
  //   .jpeg({quality : 50}).toFile(__dirname
  //       + '/images/avatar_thumb.jpg');

  // Check filesize
  // if (file.size > process.env.MAX_FILE_UPLOAD) {
    sharp(file.data)
      .jpeg({ quality: 20 })
      .toFile(`${process.env.FILE_UPLOAD_PATH_EMPLOYEE}/${file.name}`);
  // }

  // if (file.size > process.env.MIN_FILE_UPLOAD && file.size < process.env.MAX_FILE_UPLOAD) {
    // sharp(file.data)
    //   .jpeg({ quality: 20 })
    //   .toFile(`${process.env.FILE_UPLOAD_PATH}/${file.name}`);
  // }

  // file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
  //   if (err) {
  //     console.error(err);
  //     return next(new ErrorResponse(`Problem with file upload`, 500));
  //   }

  //   // Check filesize
  //   if (file.size > process.env.MAX_FILE_UPLOAD) {
  //     sharp(`${process.env.FILE_UPLOAD_PATH}/${file.name}`)
  //       .jpeg({ quality: 20 })
  //       .toFile(`${process.env.FILE_UPLOAD_PATH}/newphoto.jpg`);
  //   }

  //   if (file.size > process.env.MIN_FILE_UPLOAD && file.size < process.env.MAX_FILE_UPLOAD) {
  //     sharp(`${process.env.FILE_UPLOAD_PATH}/${file.name}`)
  //       .jpeg({ quality: 50 })
  //       .toFile(`${process.env.FILE_UPLOAD_PATH}/newphoto.jpg`);
  //   }

    await Employee.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      success: true,
      data: file.name,
    });
  // });

  // sharp(__dirname + `/images/${employee._id}.jpg`)
  //   .jpeg({quality : 50}).toFile(__dirname
  //       + '/images/avatar_thumb.jpg');

  // res.json({
  //   sucess: true,
  //   data: employee
  // })
});

exports.deleteEmployee = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findByIdAndUpdate(req.params.id, {
    delete_account: true,
  });

  if (!employee) {
    return next(
      new ErrorResponse(`There is No Employee With ID of ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
  });
});

exports.loginEmployee = asyncHandler(async (req, res, next) => {
  const { business_email, password } = req.body;

  //Validation Phone Number And Password
  if (!business_email || !password) {
    return next(
      new ErrorResponse("Please Provide an Business Email and password", 400)
    );
  }

  //Check For Employee
  const employee = await Employee.findOne({ business_email }).select(
    "+password"
  );

  if (!employee) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  //Check if Password Matches
  const isMatch = await employee.matchPassword(password);

  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }
  sendTokenResponse(employee, 200, res);
});

//Get Current Logged in Employee
exports.getMe = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findById(req.employee.id);

  res.status(200).json({
    sucess: true,
    data: employee,
  });
});

//Get Token From Module , Create Cookie and send Response
const sendTokenResponse = (employee, statusCode, res) => {
  //Create Token
  const token = employee.getSignedJwtToken();

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

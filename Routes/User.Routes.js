const express = require("express");

const {
  getUsers,
  createUser,
  loginUser,
  logoutUser,
  getMe,

  searchByPhoneNumber,
  searchByUserName,

  updateuser,
  updateToClientAccount,

  deleteUser,
  setIntrested,
  removeIntrested,

  setLike,
  unSetLike,

  createVerficationCode,

  setRateforBrand,
  getBrandByUser,
  updateUserRate,

  uploadUserImage,

  //Search
  setBrandSearch,
  deleteBrandSearch,
  getBrandSearch,
  //user ads views
  userAdsViews,
  //Notification
  pushUserNotification,
  getUserNotification,

  //intrested
  getMyIntrestedBrand,
} = require("../Controller/User.Controller");
const {
  protect,
  authorizeEmployee,
  protectEmployee,
  authorize,
} = require("../middleware/auth");
const router = express.Router();

router
  .route("/")
  .get(protectEmployee, authorizeEmployee("admin"), getUsers)
  .post(createUser)
  .put(protect, updateuser);

//Update User
// router.route("/update").post(protect, authorize("user"), updateuser);
//Login && Sign up
router.route("/login").post(loginUser);
router.route("/logout").get(logoutUser);
//get user Info
router.route("/me").get(protect, getMe);
//Update to Client
router
  .route("/updatetoclient")
  .post(protect, authorize("user"), updateToClientAccount);

//serch By Phone NUmber
router.route("/checkphonenumber").post(searchByPhoneNumber);
router.route("/checkusername").post(searchByUserName);

//intrested
router.route("/intrested/:brandid").put(protect, setIntrested);
router.route("/removeintrested/:brandid").put(protect, removeIntrested);
//Like
router.route("/like/:adsid").put(protect, setLike);
router.route("/unlike/:adsid").put(protect, unSetLike);

//ads Views
router.route("/adsviews/:adsid").put(protect, userAdsViews);

//Verfication Code
router.route("/getverfication/:adsid").post(protect, createVerficationCode);

router.route("/intrestedbrand").get(protect, getMyIntrestedBrand);

//Uploade Profile
router.route("/profile").post(protect, uploadUserImage);

//set Rate For Brand
router
  .route("/brand/:brandid")
  .get(protect, getBrandByUser)
  .post(protect, setRateforBrand)
  .put(protect, updateUserRate);

//search
router.route("/search").get(protect, getBrandSearch);
router
  .route("/search/:brandid")
  .post(protect, setBrandSearch)
  .put(protect, deleteBrandSearch);

//Notification
router
  .route("/noti")
  .put(protect, pushUserNotification)
  .get(protect, getUserNotification);

module.exports = router;

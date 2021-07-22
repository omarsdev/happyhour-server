const express = require("express");

//import autherizetion
const { protect, authorize, protectEmployee } = require("../middleware/auth");

const {
  createAds,
  getAds,
  adsPhotoUpload,
  getAllAds,

  confirmVerfication,
  verfyVerficatonCode,

  uploadPhotoTest,
} = require("../Controller/Ads.Controller");

const router = express.Router();
//-----------------------------ADS-----------------------------
router.route("/").get(protect, getAllAds);

router
  .route("/:brandid/ads")
  .post(protect, authorize("client"), createAds)
  .get(protect, getAds);
router
  .route("/:id/ads/photo")
  .put(protect, authorize("client"), adsPhotoUpload);

router.route("/test").post(uploadPhotoTest);

//-----------------------------Verfication Code-----------------------------
router.route("/checkverfication").post(verfyVerficatonCode);
// .get(protect, authorize("client"), verfyVerficatonCode);
router
  .route("/confirmverfication/:id")
  .put(protect, authorize("client"), confirmVerfication);

module.exports = router;

const express = require("express");

const { protect, authorize, protectEmployee } = require("../middleware/auth");

const {
  createVerficationCodeGift,
  createVerficationCodeStore,
  createVerficationCodeADS,

  checkCode,
  checkVerficationCode,
} = require("../Controller/VerficationController");

const router = express.Router();

router
  .route("/:brnadId")
  .post(protect, authorize("client", "casher"), checkCode);
router
  .route("/check/:brnadId")
  .post(protect, authorize("client", "casher"), checkVerficationCode);
router.route("/gift/:giftid").post(protect, createVerficationCodeGift);
router.route("/store/:storeid").post(protect, createVerficationCodeStore);
router.route("/ads/:adsid").post(protect, createVerficationCodeADS);

module.exports = router;

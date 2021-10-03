const express = require("express");

const { protect, authorize, protectEmployee } = require("../middleware/auth");

const {
  createVerficationCodeGift,
  createVerficationCodeStore,
  createVerficationCodeADS,

  comfirmVerficationCode,
  checkVerficationCode,

  getUserVerficationGift,
} = require("../Controller/VerficationController");

const router = express.Router();

router
  .route("/:brancheId")
  .post(protect, authorize("client", "casher"), comfirmVerficationCode);

//check user code
router
  .route("/check/:brancheId")
  .post(protect, authorize("client", "casher"), checkVerficationCode);
router.route("/gift/:giftid").post(protect, createVerficationCodeGift);
router.route("/store/:storeid").post(protect, createVerficationCodeStore);
router.route("/ads/:adsid").post(protect, createVerficationCodeADS);

router.route("/user/gift").get(protect, getUserVerficationGift);

module.exports = router;

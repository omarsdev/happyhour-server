const express = require("express");

const { protect, authorize } = require("../middleware/auth");
const { checkCode, verfiyCode } = require("../middleware/code")

const {
  getAllGifts,
  createNewBrandGift,
  getAllGift,
  //chacher
  checkGiftCode,
  confirmGiftCode,
} = require("../Controller/Gift.Controller");

const router = express.Router();

router.route("/").get(protect, getAllGifts);
//cacher
router
  .route("/check/:brandid/:branchid")
  .get(protect, authorize("client", "casher"), checkCode, checkGiftCode)
  .post(protect, authorize("client", "casher"), checkCode, verfiyCode, confirmGiftCode);
  // .post(verfiyCode, confirmGiftCode);
router
  .route("/:brandid")
  // .get(protect, checkGiftCode)
  .get(protect, getAllGift)
  .post(protect, authorize("client"), createNewBrandGift);

module.exports = router;

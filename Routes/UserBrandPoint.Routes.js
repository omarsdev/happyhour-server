const express = require("express");

const { protect, authorize } = require("../middleware/auth");

const {
  getAllUserBrandPoints,
  getSpesificUserBrnadPoint,
  getOnlyCardPoint,
  createUserCardPoint,
} = require("../Controller/UserBrandPointController");

const router = express.Router();

//TODO check if i want this route or which autherize i want to user
// router.route("/userbrnadpoint").get(protect, getAllUserBrandPoints)
router.route("/userbrnadpoint").get(protect, getAllUserBrandPoints);
router
  .route("/userbrandpoint/:brandid")
  .get(protect, getOnlyCardPoint)
  .post(protect, createUserCardPoint);

module.exports = router;

const express = require("express");

//import autherizetion
const { protect, authorize, protectEmployee } = require("../middleware/auth");

const {
  getAllStore,
  checkStoreTest,
  addHappyStore,
  removeHappyStore,
  addIWantThis,
  removeIWantThis,
  addUserRate,
  getAverageRate,
} = require("../Controller/Store.Controller");
const multer = require("multer");

const fileStorage = multer.diskStorage({
  destination: "images/test",
});
const upload = multer({
  storage: fileStorage,
});

const router = express.Router();

router
  .route("/:brandid")
  .get(protect, getAllStore)
  // .post(protect, authorize("client"), createStore);
  .post(protect, authorize("client"), checkStoreTest);
router.route("/sethappy/:storeid").put(protect, addHappyStore);
router.route("/removehappy/:storeid").put(protect, removeHappyStore);

router.route("/setiwantthis/:storeid").put(protect, addIWantThis);
router.route("/removeiwantthis/:storeid").put(protect, removeIWantThis);
// router.route("/teststore", upload.single("photo")).post(testStore);

//Rate User
router
  .route("/addrate/:storeid")
  .post(protect, addUserRate)
  .get(getAverageRate);

module.exports = router;

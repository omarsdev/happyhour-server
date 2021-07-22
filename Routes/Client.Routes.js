const express = require("express");
const {
  crateClient,
  getClients,
  getClient,
  getPayment,
  createPayment,

  verfyVerficatonCode,
  confirmVerfication,

  checkEndAds,
} = require("../Controller/Client.Controller");

//import autherizetion
const { protect, authorize, protectEmployee,  } = require("../middleware/auth");

const router = express.Router();

//-----------------------------Client-----------------------------

router.route("/get").get(getClients);
router.route("/get/:id").get(getClient);
router.route("/create").post(protect, authorize("user"), crateClient);

//-----------------------------Payment-----------------------------
router.route("/:clientid/payment/get").get(getPayment);
router.route("/:clientid/payment/create").post(protectEmployee, createPayment);
  
// router
//   .route("/:adsid/checkverfication")
//   .get(protect, authorize("client"), verfyVerficatonCode);
// router
//   .route("/:adsid/confirmverfication")
//   .put(protect, authorize("client"), confirmVerfication);

module.exports = router;

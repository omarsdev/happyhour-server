const express = require("express");

//import autherizetion
const {
  protect,
  authorize,
  protectEmployee,
  authorizeEmployee,
} = require("../middleware/auth");

const {
  createBranche,
  createBrand,
  getBranches,
  getBrand,
  getBrands,
  updateBranches,
  getBrandByEmloyee,

  uploadCoverPhoto,
  uploadLogoPhoto,

  searchBrand,
  getBrandByID,
  getSmallInfo,

  addUserRate,
  updateUserRate,

  brandIntrested,
} = require("../Controller/Brand.Controller");

const {
  getCashersBrand,
  setCahserForBrache,
  getCahserBranche,
  userConfirmCasherRequest,
  getAllBrandCasher,
} = require("../Controller/Casher.Controller");

const router = express.Router();

//-----------------------------Brand-----------------------------
router
  .route("/")
  .get(protect, authorize("client"), getBrand)
  .post(protect, authorize("client"), createBrand);
router
  .route("/all")
  .get(protectEmployee, authorizeEmployee("admin"), getBrands);
router.route("/search").get(searchBrand);
router.route("/:id").get(protect, getBrandByID);
router.route("/small/:id").get(getSmallInfo);
router.route("/cover/:id").put(protect, authorize("client"), uploadCoverPhoto);
router.route("/logo/:id").put(protect, authorize("client"), uploadLogoPhoto);
router.route("/:client").get(protectEmployee, getBrandByEmloyee);
router
  .route("/rate/:brandId")
  .post(protect, addUserRate)
  .put(protect, updateUserRate);

//-----------------------------Intrested-----------------------------

router
  .route("/intrested/:brandId")
  .get(protect, authorize("client"), brandIntrested);

//-----------------------------Branches-----------------------------
router
  .route("/branche/:brandid")
  .get(getBranches)
  .post(protect, authorize("client"), createBranche);
router
  .route("/branche/:brandid/:id")
  .put(protect, authorize("client"), updateBranches);

router.route("/branche/casher/:branchid").get(getCahserBranche);
router
  .route("/branche/casher/:brandid/:branchid")
  .get(protect, authorize("client"), getCashersBrand)
  .post(protect, authorize("client"), setCahserForBrache)
  .put(protect, userConfirmCasherRequest);

// Casher

//get all casher brand
router
  .route("/casher/:brandId")
  .get(protect, authorize("client"), getAllBrandCasher);

module.exports = router;

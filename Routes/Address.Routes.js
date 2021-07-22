const express = require("express");
const {
  getAddress,

  getCountry,
  createCountry,
  getCountries,

  getCity,
  createCity,
  getCities,

  createStreet,
  getStreet,
  getStreets,
} = require("../Controller/Address.Controller");

const router = express.Router();

const { authorizeEmployee, protectEmployee } = require("../middleware/auth");

router.route("/").get(getAddress);

//-------------------------------Country-------------------------------

router
  .route("/country")
  .get(getCountries)
  .post(
    // protectEmployee,
    // authorizeEmployee("admin", "admin_manager"),
    createCountry
  );
router.route("/country/:id").get(getCountry);

//-------------------------------City-------------------------------

router
  .route("/city/:countryid")
  .get(getCities)
  .post(
    // protectEmployee,
    // authorizeEmployee("admin", "admin_manager"),
    createCity
  );
router.route("/:countryid/city/:id").get(getCity);

//-------------------------------Street-------------------------------
router
  .route("/street/:cityid")
  .get(getStreets)
  .post(
    // protectEmployee,
    // authorizeEmployee("admin", "admin_manager"),
    createStreet
  );
router.route("/:cityid/street/:id").get(getStreet);

// router.route("/getstreets/:cityid").get(getStreet);
// router.route("/createstreet").post(protectEmployee, authorizeEmployee("admin", "admin_manager", "jr_admin"), createStreet);

// router.route("/")

module.exports = router;

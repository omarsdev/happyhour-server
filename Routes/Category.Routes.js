const express = require("express");

const {
  createCategory,
  getCategoryChildren,
  getCategories
  
} = require("../Controller/Category.Controller");
const { protectEmployee, authorizeEmployee } = require("../middleware/auth");

const router = express.Router();

//-----------------------------Category-----------------------------
router
  .route("/")
  .get(getCategories)
  .post(protectEmployee, authorizeEmployee("admin"), createCategory);

router.route("/:parentid").get(getCategoryChildren)

//-----------------------------Sub-Classification-----------------------------
// router.route("/sub/get").get(getSub);
// router.route("/sub/create").post(createSub);

module.exports = router;

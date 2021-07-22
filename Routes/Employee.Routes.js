const express = require("express");
const router = express.Router();

const {
  getEmployee,
  createEmployee,
  deleteEmployee,
  getEmployeeDeleted,
  getEmployees,
  getMe,
  loginEmployee,
  updateEmployee,

  employeePhotoUpload,
  updateEmployeePhoto
} = require("../Controller/Employee.Controller");

const { protectEmployee, authorizeEmployee } = require("../middleware/auth");

router
  .route("/get")
  .get(protectEmployee, authorizeEmployee("admin"), getEmployees);
router
  .route("/get/:id")
  .get(protectEmployee, authorizeEmployee("admin"), getEmployee);
router
  .route("/delete/get")
  .get(protectEmployee, authorizeEmployee("admin"), getEmployeeDeleted);
router.route("/create").post(createEmployee);
router
  .route("/delete/:id")
  .put(protectEmployee, authorizeEmployee("admin"), deleteEmployee);
router
  .route("/update")
  .put(protectEmployee, authorizeEmployee("admin"), updateEmployee);
router.route("/me").get(protectEmployee, getMe);

router.route("/updatephoto/:id").put(updateEmployeePhoto)

router.route("/login").get(loginEmployee);

module.exports = router;

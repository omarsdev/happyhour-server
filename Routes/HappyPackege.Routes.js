const express = require("express");
const router = express.Router();

const { createPackege, getPackege, createPackegeAds, getPackegeAds } = require("../Controller/HappyPackege.Controller");
const { protectEmployee, authorizeEmployee } = require("../middleware/auth");

//-----------------------------Happy Hour Packege-----------------------------

router.route("/happy").post(protectEmployee, createPackege).get(getPackege);

router.route("/ads").post(protectEmployee, createPackegeAds).get(getPackegeAds);

module.exports = router;

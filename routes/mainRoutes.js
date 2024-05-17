const express = require("express");
const router = express.Router();
const userControl = require("../controller/userControl");

router.get("/home", userControl.user);

module.exports = router;

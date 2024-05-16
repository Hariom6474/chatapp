const express = require("express");
const signUpController = require("../controller/signUpControl");
const router = express.Router();

router.get("/signUp", signUpController.getSignUppage);

module.exports = router;

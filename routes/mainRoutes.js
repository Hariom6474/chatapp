const express = require("express");
const router = express.Router();
const userControl = require("../controller/userControl");
const userAuthentication = require("../middleware/auth");

router.get("/home", userControl.user);
router.post(
  "/home",
  userAuthentication.authenticate,
  userControl.postAddMessage
);
router.get(
  "/home/get-message",
  userAuthentication.authenticate,
  userControl.getUserMessage
);

module.exports = router;

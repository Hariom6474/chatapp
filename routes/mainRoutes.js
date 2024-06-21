const express = require("express");
const router = express.Router();
const userControl = require("../controller/userControl");
const userAuthentication = require("../middleware/auth");

router.get("/", userControl.user);
router.post("/", userAuthentication.authenticate, userControl.postAddMessage);
// router.get(
//   "/get-message",
//   userAuthentication.authenticate,
//   userControl.getUserMessage
// );
router.get(
  "/get-users",
  userAuthentication.authenticate,
  userControl.showUsers
);

module.exports = router;

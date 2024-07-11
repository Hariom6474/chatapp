const express = require("express");
const adminController = require("../controller/admin");
const userAuthenticate = require("../middleware/auth");
const router = express.Router();

router.get(
  "/getUsers",
  userAuthenticate.authenticate,
  adminController.getUsers
);
router.post(
  "/addAdmin",
  userAuthenticate.authenticate,
  adminController.addAdmin
);

module.exports = router;

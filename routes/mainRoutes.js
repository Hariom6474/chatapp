const express = require("express");
const router = express.Router();
const multer = require("multer");
const userControl = require("../controller/userControl");
const userAuthentication = require("../middleware/auth");

// Multer middleware for handling file uploads
const upload = multer({ dest: "public/uploads/" });

router.get("/", userControl.user);
router.post(
  "/add-message",
  userAuthentication.authenticate,
  upload.array("files"),
  userControl.postAddMessage
);
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

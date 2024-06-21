const express = require("express");
const router = express.Router();
const userAuth = require("../middleware/auth");
const groupController = require("../controller/group");

router.post("/createGroup", userAuth.authenticate, groupController.createGroup);
router.get("/getGroups", userAuth.authenticate, groupController.getGroups);
router.get(
  "/getGroupChat",
  userAuth.authenticate,
  groupController.getGroupChat
);

module.exports = router;

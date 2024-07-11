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
router.get(
  "/showUsersOfGroup",
  userAuth.authenticate,
  groupController.showUsers
);
router.get(
  "/getGroupAdmins",
  userAuth.authenticate,
  groupController.getGroupAdmins
);
router.get("/checkAdmin", userAuth.authenticate, groupController.checkAdmin);
router.get(
  "/showUsersForAdding",
  userAuth.authenticate,
  groupController.showUsersForAdding
);
router.post("/addUsers", userAuth.authenticate, groupController.addUsers);
router.get(
  "/showUsersForRemoving",
  userAuth.authenticate,
  groupController.showUsersForRemoving
);
router.post("/removeUsers", userAuth.authenticate, groupController.removeUsers);

module.exports = router;

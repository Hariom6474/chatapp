const express = require("express");

const router = express.Router();

const errorController = require("../controller/error");

router.use(errorController.errormessage);

module.exports = router;

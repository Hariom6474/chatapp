const jwt = require("jsonwebtoken");
const User = require("../models/user");

exports.authenticate = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    // console.log("token........", token);
    const user = jwt.verify(token, process.env.TOKEN_SECRET);
    // console.log("user>>>>>", user.userId);
    const users = await User.findByPk(user.userId);
    // console.log("users@@@@@@@@", users);
    if (users) {
      req.user = users;
      next();
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({ success: false, error: err });
  }
};

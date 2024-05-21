const User = require("../models/user");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.getLoginpage = async (req, res, next) => {
  await res.sendFile(path.join(__dirname, "../views", "login.html"), (err) => {
    if (err) {
      console.error("Error sending login.html file:", err);
      res.status(402).send("Error occurred");
    } else {
      // console.log("login.html file sent successfully");
    }
  });
};

function isStringInvalid(string) {
  if (string == undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.postLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // console.log(email, "@@@@@@");
    if (isStringInvalid(email) || isStringInvalid(password)) {
      return res.status(400).json({
        success: false,
        error: "Bad parameters, something is missing.",
      });
    }
    const user = await User.findOne({
      where: { email: email },
    });
    // console.log(user.email, "########");
    if (user && user.email && user.email.length > 0) {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          throw new Error("Something went wrong");
        }
        if (result === true) {
          return res.status(200).json({
            success: true,
            message: "user logged in successfully",
            token: generateAccessToken(user.id),
          });
        } else {
          res
            .status(402)
            .json({ success: false, message: "Password is wrong" });
        }
      });
    } else {
      res.status(404).json({ success: false, message: "user not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

function generateAccessToken(id) {
  return jwt.sign({ userId: id }, process.env.TOKEN_SECRET, {
    expiresIn: "1800s",
  });
}

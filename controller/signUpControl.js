const User = require("../models/user");
const bcrypt = require("bcrypt");

exports.getSignUppage = async (req, res, next) => {
  await res.sendFile("signUp.html", { root: "views" });
};

function isStringInvalid(string) {
  if (string == undefined || string.length === 0) {
    return true;
  } else {
    return false;
  }
}

exports.postSignUp = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    if (
      isStringInvalid(name) ||
      isStringInvalid(email) ||
      isStringInvalid(phone) ||
      isStringInvalid(password)
    ) {
      return res
        .status(400)
        .json({ error: "Bad parameters, something is missing." });
    }
    const existingUser = await User.findOne({
      where: { email: email },
    });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    } else {
      bcrypt.hash(password, 10, async (err, hash) => {
        console.log(err);
        const data = await User.create({
          name: name,
          email: email,
          phone: phone,
          password: hash,
        });
        // console.log(data);
        return res.redirect("/login");
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

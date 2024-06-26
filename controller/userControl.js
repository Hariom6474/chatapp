const path = require("path");
const ChatHistory = require("../models/chatHistory");
const User = require("../models/user");
const { Op } = require("sequelize");

exports.user = async (req, res, next) => {
  await res.sendFile(path.join(__dirname, "../views", "home.html"), (err) => {
    if (err) {
      console.error("Error sending home.html file:", err);
      res.status(500).send("Error occurred");
    } else {
      // console.log("login.html file sent successfully");
    }
  });
};

exports.postAddMessage = async (req, res, next) => {
  try {
    const { message, groupId } = req.body;
    const userId = req.user.id;
    if (message == undefined || message.length === 0 || groupId == undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Parameters missing!" });
    }
    const data = await ChatHistory.create({
      message: message,
      userId: userId,
      groupId: groupId,
    });
    res.status(201).json(data);
    // console.log(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

// exports.getUserMessage = async (req, res, next) => {
//   try {
//     const data = await ChatHistory.findAll({
//       include: [
//         {
//           model: User,
//           attributes: ["name"],
//         },
//       ],
//     });
//     return res.status(200).json(data);
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ error: err });
//   }
// };

exports.showUsers = async (req, res, next) => {
  try {
    const data = await User.findAll({
      where: { [Op.not]: [{ id: req.user.id }] },
      attributes: ["Name", "id"],
    });
    res.status(201).json({ User: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

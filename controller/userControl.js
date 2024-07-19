const path = require("path");
const ChatHistory = require("../models/chatHistory");
const User = require("../models/user");
const { Op } = require("sequelize");
const sequelize = require("../util/database");
const { uploadToS3 } = require("../services/s3service");
const { log } = require("console");
require("aws-sdk/lib/maintenance_mode_message").suppress = true;

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
  const t = await sequelize.transaction();
  try {
    let message = req.body.text;
    let files = req.files;
    const groupId = req.query.groupId;
    const userId = req.user.id;
    if (
      message === undefined ||
      message.length === 0 ||
      groupId === undefined
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Parameters missing!" });
    }
    let data;
    if (files.length === 0) {
      data = await ChatHistory.create(
        {
          message: message,
          userId: userId,
          userName: req.user.name,
          groupId: groupId,
          fileStatus: false,
        },
        { transaction: t }
      );
    } else {
      const fileUrls = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const body = require("fs").createReadStream(file.path);
        const fileName = `${file.originalname}_${new Date()}`;
        const ContentType = file.mimetype;
        const Url = await uploadToS3(ContentType, body, fileName);
        fileUrls.push({ Url: Url, type: ContentType, name: file.originalname });

        require("fs").unlinkSync(file.path);
      }
      data = await ChatHistory.create(
        {
          message: message,
          userId: req.user.id,
          userName: req.user.name,
          groupId: groupId,
          fileStatus: true,
          fileUrl: JSON.stringify(fileUrls),
        },
        { transaction: t }
      );
    }
    await t.commit();
    res.status(201).json({ chatDetails: data });
  } catch (err) {
    await t.rollback();
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

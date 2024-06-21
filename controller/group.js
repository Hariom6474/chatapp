const Group = require("../models/group.js");
const User = require("../models/user.js");
const Sequelize = require("../util/database.js");
const { Op } = require("sequelize");
const Chat = require("../models/chatHistory.js");

exports.createGroup = async (req, res, next) => {
  const t = await Sequelize.transaction();
  try {
    const newGroup = await Group.create(
      {
        groupName: req.body.name,
        createdBy: req.user.id,
      },
      { transaction: t }
    );
    const groupUsers = req.body.users;
    groupUsers.push(req.user.id);
    groupUsers.forEach(async (userId) => {
      await newGroup.addUser(userId, { through: "groupUser" });
    });
    await t.commit();
    res.status(200).json({ details: newGroup });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.getGroups = async (req, res, next) => {
  try {
    const userGroups = await User.findAll({
      include: [{ model: Group, attributes: ["id", "groupName"] }],
      where: { id: req.user.id },
      attributes: ["name"],
    });
    res.status(200).json(userGroups);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.getGroupChat = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const data = await Chat.findAll({
      where: { groupId: groupId },
      include: [
        {
          model: User,
          attributes: ["name"],
        },
      ],
    });
    res.status(201).json({ chats: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

const Group = require("../models/group.js");
const User = require("../models/user.js");
const Sequelize = require("../util/database.js");
const { Op } = require("sequelize");
const Chat = require("../models/chatHistory.js");
const Admin = require("../models/admin.js");

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
    const newAdmin = await Admin.create({
      groupId: newGroup.id,
      userId: req.user.id,
    });
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

exports.showUsers = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const data = await Group.findAll({
      include: [{ model: User, attributes: ["name"] }],
      where: { id: groupId },
      attributes: ["groupName"],
    });
    // console.log(data);
    res.status(201).json({ users: data });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.getGroupAdmins = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const admins = await Admin.findAll({
      where: { groupId: groupId },
      include: {
        model: User,
        attributes: ["name"],
      },
      attributes: ["id"],
    });
    0;
    // console.log(admins);
    const users = admins.map((admin) => admin.user.name);
    // console.log("Admins:", users);
    res.status(201).json({ admins: users });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.checkAdmin = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const checkAdmin = await Admin.findOne({
      where: { groupId: groupId, userId: req.user.id },
    });
    if (checkAdmin) {
      res.status(201).json({ success: true });
    } else {
      res.status(201).json({ success: false });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.showUsersForAdding = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const group = await Group.findOne({
      include: [{ model: User, attributes: ["id"] }],
      where: { id: groupId },
      attributes: ["id"],
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    const groupUserIds = group.users.map((user) => user.id);
    const usersNotInGroup = await User.findAll({
      where: {
        id: { [Op.notIn]: groupUserIds },
      },
      attributes: ["id", "name"],
    });
    res.status(201).json(usersNotInGroup);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.addUsers = async (req, res, next) => {
  const t = await Sequelize.transaction();
  try {
    const groupId = req.query.groupId;
    const users = req.body.users;
    const group = await Group.findOne({ where: { id: groupId } });
    await Promise.all(
      users.map((userId) =>
        group.addUser(userId, { through: "group_users", transaction: t })
      )
    );
    await t.commit();
    res.sendStatus(200);
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.showUsersForRemoving = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const group = await Group.findOne({
      where: { id: groupId },
      attributes: ["createdBy"],
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    // If the current user is the creator of the group
    if (group.CreatedById === req.user.id) {
      const data = await Group.findAll({
        include: [
          {
            model: User,
            attributes: ["name", "id"],
            where: { [Op.not]: [{ id: req.user.id }] },
          },
        ],
        where: { id: groupId },
        attributes: ["name"],
      });

      const users = data.length > 0 ? data[0].users : [];
      return res.status(201).json(users);
    }
    // If the current user is not the creator of the group
    const [admins, data] = await Promise.all([
      Admin.findAll({
        where: { groupId },
        attributes: ["userId"],
      }),
      Group.findAll({
        include: [{ model: User, attributes: ["id", "name"] }],
        where: { id: groupId },
        attributes: ["groupName"],
      }),
    ]);
    const adminUserIds = new Set(admins.map((admin) => admin.userId));
    const allUsers = data.length > 0 ? data[0].users : [];
    const users = allUsers.filter((user) => !adminUserIds.has(user.id));
    res.status(201).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.removeUsers = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const users = req.body.users;
    const data = await Group.findOne({ where: { id: groupId } });
    if (!data) {
      return res.status(404).json({ error: "Group not found" });
    }
    await Promise.all([
      ...users.map((userId) =>
        data.removeUser(userId, { through: "group_users" })
      ),
      ...users.map((userId) => Admin.destroy({ where: { groupId, userId } })),
    ]);
    res.sendStatus(201);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

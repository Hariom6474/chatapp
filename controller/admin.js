const Admin = require("../models/admin");
const User = require("../models/user");
const Group = require("../models/group");
const sequelize = require("../util/database");

exports.getUsers = async (req, res, next) => {
  try {
    const groupId = req.query.groupId;
    const admins = await Admin.findAll({
      where: { groupId: groupId },
      attributes: ["userId"],
    });
    const adminUserIds = new Set(admins.map((admin) => admin.userId));
    const groupData = await Group.findOne({
      include: [{ model: User, attributes: ["id", "name"] }],
      where: { id: groupId },
      attributes: ["groupName"],
    });
    const users = groupData
      ? groupData.users.filter((user) => !adminUserIds.has(user.id))
      : [];
    res.status(200).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err });
  }
};

exports.addAdmin = async (req, res, next) => {
  const t = await sequelize.transaction();
  try {
    const { groupId } = req.query;
    const { users } = req.body;
    await Promise.all(
      users.map((userId) =>
        Admin.create({ groupId, userId }, { transaction: t })
      )
    );
    await t.commit();
    res.sendStatus(201);
  } catch (err) {
    await t.rollback();
    console.log(err);
    res.status(500).json({ error: err });
  }
};

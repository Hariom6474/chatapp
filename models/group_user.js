const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const GroupUser = sequelize.define("group_user", {
  groupId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});

module.exports = GroupUser;

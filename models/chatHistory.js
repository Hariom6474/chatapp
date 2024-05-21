const Sequelize = require("sequelize");
const sequelize = require("../util/database");

const ChatHistory = sequelize.define("ChatHistory", {
  id: {
    type: Sequelize.BIGINT,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  message: {
    type: Sequelize.TEXT(),
    allowNull: false,
  },
});
module.exports = ChatHistory;

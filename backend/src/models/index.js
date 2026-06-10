const sequelize = require("../config/database");
const User = require("./User");
const Project = require("./Project");

const syncDB = async () => {
  // force: false — never drop tables, just create if not exists
  await sequelize.sync({ force: false });
  console.log("Database synced");
};

module.exports = { sequelize, User, Project, syncDB };
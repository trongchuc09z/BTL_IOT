require("dotenv").config();
// Tạo kết nối đến MySQL bằng Sequelize
const { Sequelize } = require("sequelize");
const sequelize = new Sequelize(
  process.env.DATABASE_NAME,
  process.env.DATABASE_USER,
  process.env.DATABASE_PASSWORD,
  {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT || 3306,
    dialect: "mysql",
    logging: false,
  }
);

// Hàm kiểm tra kết nối đến database
const connection = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully to database.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = { connection, sequelize };

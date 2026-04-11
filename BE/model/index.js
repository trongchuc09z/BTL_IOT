const fs = require("fs"); // thư viện fs để đọc file trong thư mục models viết tắt của file index.js
const path = require("path"); // thư viện path để xử lý đường dẫn file trong thư mục models
const Sequelize = require("sequelize"); // thư viện Sequelize để kết nối và tương tác với cơ sở dữ liệu
const process = require("process"); // thư viện process để truy cập biến môi trường NODE_ENV
const basename = path.basename(__filename); // lấy tên file hiện tại (index.js) để loại bỏ khi đọc các file model khác trong thư mục models
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config.json")[env];
const db = {};

// Khởi tạo Sequelize với cấu hình từ file config.json, nếu có biến môi trường được chỉ định thì sử dụng nó, ngược lại sử dụng cấu hình mặc định
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}
// Đọc tất cả các file trong thư mục models, loại bỏ file index.js và các file test, sau đó import và khởi tạo các model

fs.readdirSync(__dirname)
  // lọc các file có đuôi .js, không phải file index.js và không phải file test để import
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  // gọi từng file model để khởi tạo và lưu vào đối tượng db với tên model làm key, sau đó gọi hàm associate nếu có để thiết lập quan hệ giữa các model
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    db[model.name] = model;
  });
// Thiết lập quan hệ giữa các model nếu có hàm associate được định nghĩa trong model đó
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;




// đọc cấu hình DB từ config.json
// tạo kết nối Sequelize
// tự động load toàn bộ model
// gắn quan hệ giữa các model
// export thành object db để service sử dụng
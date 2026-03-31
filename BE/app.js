const express = require("express"); // Framework web cho Node.js
const cors = require("cors"); // Middleware để xử lý CORS, giúp FE chạy ở port/domain khác có thể gọi API đến server này mà không bị trình duyệt chặn.
const path = require("path"); // Module mặc định của Node.js để xử lý đường dẫn file thư mục.
const { connection } = require("./config/connectDb"); // Hàm kết nối database
const { connectMqtt } = require("./config/connectMqtt"); // Hàm kết nối MQTT
const apiRouter = require("./router/index.router"); // Router API
const swaggerUI = require("swagger-ui-express");
const swaggerSpec = require("./swagger");
// Công cụ để tự động tạo và hiển thị tài liệu API dưới dạng giao diện web.

// Khởi tạo ứng dụng và kết nối Database
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../FE")));
connection();

// Cấu hình Socket.IO
const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);
io.on("connection", (socket) => {
  console.log("A user connected");
  socket.on("message", (msg) => {
    console.log("Message received from client: " + msg);
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

// Import hàm lưu dữ liệu cảm biến vào DB
const { saveDataSensor } = require("./service/data_sensor.service");

// --- TẮT GIẢ LẬP DỮ LIỆU ---
// function getRandomValue(min, max) {
//   return (Math.random() * (max - min) + min).toFixed(2);
// }
// setInterval(async () => {
//   const temp = getRandomValue(20, 30);
//   const humidity = getRandomValue(40, 60);
//   const light_level = getRandomValue(100, 1000);
//   io.emit("data_sensor", `${temp} ${humidity} ${light_level}`);
//   await saveDataSensor({
//     temperature: parseFloat(temp),
//     humidity: parseFloat(humidity),
//     light_level: parseFloat(light_level),
//     winds: null,
//   });
//   console.log(`Sent & Saved: Temp: ${temp}, Humidity: ${humidity}, Light: ${light_level}`);
// }, 2000);

// --- BẬT KẾT NỐI MẠCH THẬT (MQTT) ---
connectMqtt(io);

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

// Khởi chạy Server và cấu hình API/Swagger
server.listen(9999, () => {
  console.log(
    `Socket server is running on port 9999 ${process.env.SERVER_HOST}`
  );
});
apiRouter(app);
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));


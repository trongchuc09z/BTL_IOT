// Import và Cấu hình MQTT Client
require("dotenv").config();
const mqtt = require("mqtt"); // Import thư viện mqtt
const client = mqtt.connect(process.env.MQTT_BROKER, {
  username: process.env.MQTT_USER,
  password: process.env.MQTT_PASSWORD,
  port: process.env.MQTT_PORT,
});

// Định nghĩa các MQTT Topics
const dataTopicResponse = "home/sensor/data";
const statusLedResponse = "home/led/response";
const statusFanResponse = "home/fan/response";
const statusAirConditionerResponse = "home/air_conditioner/response";

// Import Service Functions
const { saveDataSensor } = require("../service/data_sensor.service"); //  Lưu dữ liệu cảm biến vào bảng data_sensor
const { saveHistoryDevice, getLatestDeviceStatusService } = require("../service/history_device.service"); // Lưu lịch sử thiết bị vào bảng history_device

// Định nghĩa request topics để publish khi connect
const statusLedRequest = "home/led/request";
const statusFanRequest = "home/fan/request";
const statusAirConditionerRequest = "home/air_conditioner/request";

const connectMqtt = (io) => {
  // Đây là hàm chính để thiết lập kết nối MQTT và xử lý message.
  client.on("connect", async () => {
    console.log("Connected to MQTT broker");

    try {
      // Mỗi lần kết nối MQTT thì sẽ lấy dữ liệu thiết bị từ database để bật/tắt theo db
      const deviceStatusResponse = await getLatestDeviceStatusService();
      if (deviceStatusResponse.status === 200) {
        const statuses = deviceStatusResponse.data;
        console.log("Syncing device statuses to MQTT:", statuses);
        
        client.publish(statusLedRequest, statuses.led === "ON" ? "1" : "0");
        client.publish(statusFanRequest, statuses.fan === "ON" ? "1" : "0");
        client.publish(statusAirConditionerRequest, statuses.ac === "ON" ? "1" : "0");
      }
    } catch (error) {
      console.error("Lỗi khi đồng bộ trạng thái thiết bị lên MQTT(db):", error);
    }

    // Subscribe 4 topics
    client.subscribe(dataTopicResponse, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", dataTopicResponse);
      }
    });

    client.subscribe(statusLedResponse, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", statusLedResponse);
      }
    });

    client.subscribe(statusFanResponse, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", statusFanResponse);
      }
    });

    client.subscribe(statusAirConditionerResponse, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", statusAirConditionerResponse);
      }
    });

  });

  //call back
  // Xử lý lỗi kết nối
  client.on("error", (err) => {
    console.error("MQTT connection error:", err);
  });


  // Xử lý message nhận được từ MQTT broker
  client.on("message", async (topic, message) => {
    // 📊 Xử lý dữ liệu Sensor (topic = "home/sensor/data")
    if (topic === dataTopicResponse) {
      const sensorData = JSON.parse(message.toString());
      let temp = sensorData.temperature.toFixed(2);
      sensorData.temperature = temp;
      let humidity = sensorData.humidity;
      let light_level = sensorData.light_level;
      console.log(
        `Data nhận được từ sensor: ${temp} ${humidity} ${light_level}`
      );
      io.emit("data_sensor", `${temp} ${humidity} ${light_level}`);
      const statussaveDataSensor = await saveDataSensor(sensorData);
      console.log(statussaveDataSensor);
    }
    // 💡 Xử lý trạng thái LED (topic = "home/led/response")
    if (topic === statusLedResponse) {
      const data = message.toString();
      console.log(`led status: ${data}`);
      const statussaveHistoryDevice = await saveHistoryDevice("Led", data);
      console.log(statussaveHistoryDevice);
      io.emit("led_status", data);
    }
    // 🌀 Xử lý trạng thái Fan (topic = "home/fan/response")
    if (topic === statusFanResponse) {
      const data = message.toString();
      console.log(`fan status: ${data}`);
      const statussaveHistoryDevice = await saveHistoryDevice("Fan", data);
      console.log(statussaveHistoryDevice);
      io.emit("fan_status", data);
    }
    // ❄️ Xử lý trạng thái Air Conditioner (topic = "home/air_conditioner/response")
    if (topic === statusAirConditionerResponse) {
      const data = message.toString();
      console.log(`air_conditioner status: ${data}`);
      const statussaveHistoryDevice = await saveHistoryDevice(
        "Air Conditioner",
        data
      );
      console.log(statussaveHistoryDevice);
      io.emit("air_conditioner_status", data);
    }
  });
};
module.exports = { connectMqtt, client };

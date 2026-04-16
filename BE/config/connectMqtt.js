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
const statusBuzzerResponse = "home/buzzer/response";
const statusPumpResponse = "home/pump/response";
const deviceOnlineTopic = "home/device/online";

// Import Service Functions
const { saveDataSensor } = require("../service/data_sensor.service"); //  Lưu dữ liệu cảm biến vào bảng data_sensor
const {
  updateDeviceStatusOnly,
  getLatestDeviceStatusService,
  confirmPendingHistorySave,
} = require("../service/history_device.service");

// Định nghĩa request topics để publish khi connect
const statusLedRequest = "home/led/request";
const statusFanRequest = "home/fan/request";
const statusAirConditionerRequest = "home/air_conditioner/request";
const statusBuzzerRequest = "home/buzzer/request";
const statusPumpRequest = "home/pump/request";

const syncDeviceStatusesToHardware = async () => {
  try {
    const deviceStatusResponse = await getLatestDeviceStatusService();
    if (deviceStatusResponse.status === 200) {
      const statuses = deviceStatusResponse.data;
      console.log("Syncing device statuses to hardware:", statuses);

      client.publish(statusLedRequest, statuses.led === "ON" ? "1" : "0");
      client.publish(statusFanRequest, statuses.fan === "ON" ? "1" : "0");
      client.publish(statusAirConditionerRequest, statuses.ac === "ON" ? "1" : "0");
      client.publish(statusBuzzerRequest, statuses.buzzer === "ON" ? "1" : "0");
      client.publish(statusPumpRequest, statuses.pump === "ON" ? "1" : "0");
    }
  } catch (error) {
    console.error("Lỗi khi đồng bộ trạng thái thiết bị từ DB xuống phần cứng:", error);
  }
};

const connectMqtt = (io) => {
  // Đây là hàm chính để thiết lập kết nối MQTT và xử lý message.
  client.on("connect", async () => {
    console.log("Connected to MQTT broker");

    await syncDeviceStatusesToHardware();

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

    client.subscribe(statusBuzzerResponse, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", statusBuzzerResponse);
      }
    });

    client.subscribe(statusPumpResponse, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", statusPumpResponse);
      }
    });

    client.subscribe(deviceOnlineTopic, (err) => {
      if (err) {
        console.error("Failed to subscribe to topic:", err);
      } else {
        console.log("Subscribed to topic:", deviceOnlineTopic);
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
      const statussaveDataSensor = await saveDataSensor(sensorData);
      console.log(statussaveDataSensor);
      io.emit("data_sensor", {
        Temperature: parseFloat(temp),
        Humidity: humidity,
        Light: light_level,
        Time: statussaveDataSensor.data?.Time || null,
      });
    }
    // 💡 Xử lý trạng thái LED (topic = "home/led/response")
    if (topic === statusLedResponse) {
      const data = message.toString();
      console.log(`led status: ${data}`);
      const statusUpdateDevice = await confirmPendingHistorySave("Led", data);
      console.log(statusUpdateDevice);
      io.emit("led_status", data);
    }
    // 🌀 Xử lý trạng thái Fan (topic = "home/fan/response")
    if (topic === statusFanResponse) {
      const data = message.toString();
      console.log(`fan status: ${data}`);
      const statusUpdateDevice = await confirmPendingHistorySave("Fan", data);
      console.log(statusUpdateDevice);
      io.emit("fan_status", data);
    }
    // ❄️ Xử lý trạng thái Air Conditioner (topic = "home/air_conditioner/response")
    if (topic === statusAirConditionerResponse) {
      const data = message.toString();
      console.log(`air_conditioner status: ${data}`);
      const statusUpdateDevice = await confirmPendingHistorySave(
        "Air Conditioner",
        data
      );
      console.log(statusUpdateDevice);
      io.emit("air_conditioner_status", data);
    }
    // 🔔 Xử lý trạng thái Buzzer (topic = "home/buzzer/response")
    if (topic === statusBuzzerResponse) {
      const data = message.toString();
      console.log(`buzzer status: ${data}`);
      const statusUpdateDevice = await confirmPendingHistorySave("Buzzer", data);
      console.log(statusUpdateDevice);
      io.emit("buzzer_status", data);
    }
    // 💧 Xử lý trạng thái Pump (topic = "home/pump/response")
    if (topic === statusPumpResponse) {
      const data = message.toString();
      console.log(`pump status: ${data}`);
      const statusUpdateDevice = await confirmPendingHistorySave("Pump", data);
      console.log(statusUpdateDevice);
      io.emit("pump_status", data);
    }

    if (topic === deviceOnlineTopic) {
      console.log(`device online: ${message.toString()}`);
      await syncDeviceStatusesToHardware();
    }
  });
};
module.exports = { connectMqtt, client };

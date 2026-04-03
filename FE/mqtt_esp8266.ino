#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <DHT.h>

#define MQTT_TOPIC_DATA "home/sensor/data"

// Đã sửa cú pháp #define (xóa dấu = và ;) và khớp tên topic với HomeController.js
#define MQTT_TOPIC_LED_REQ "home/led/request"
#define MQTT_TOPIC_FAN_REQ "home/fan/request"
#define MQTT_TOPIC_AIR_REQ "home/air_conditioner/request"
#define MQTT_TOPIC_DEVICE_ONLINE "home/device/online"

// Định nghĩa các topic phản hồi trạng thái
#define MQTT_TOPIC_LED_RES "home/led/response"
#define MQTT_TOPIC_FAN_RES "home/fan/response"
#define MQTT_TOPIC_AIR_RES "home/air_conditioner/response"

/* ================= PIN ================= */
#define DHT_PIN D1  // GPIO5
#define LDR_PIN A0  // Analog 0

#define LED_TEMP D5  // Dùng cho Fan
#define LED_HUM D6   // Dùng cho Air Conditioner
#define LED_LDR D7   // Dùng cho Led

#define DHTTYPE DHT11

// ================= THÔNG TIN WIFI & MQTT =================
const char* ssid = "Iphone";
const char* password = "pocof4gt";

const char* mqtt_server = "192.168.188.80";  
const int mqtt_port = 3101;                 
const char* mqtt_user = "nguyentrongchuc";  
const char* mqtt_pwd = "123456";            

WiFiClient espClient;
PubSubClient client(espClient);
DHT dht(DHT_PIN, DHTTYPE);

/* ================= TRẠNG THÁI THIẾT BỊ ================= */
bool stateFan = false;
bool stateAir = false;
bool stateLed = false;

/* ================= BIẾN THỜI GIAN VÀ HIỆU ỨNG ================= */
unsigned long lastSensorReadTime = 0;
const long sensorInterval = 2000; // Đọc cảm biến mỗi 2 giây

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  randomSeed(micros());

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  String message = "";
  for (unsigned int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  message.trim();
  
  Serial.print("[MQTT] Topic: ");
  Serial.print(topic);
  Serial.print(" | Message: ");
  Serial.println(message);

  /* ================= DEVICE CONTROL ================= */
  // Kiểm tra Topic nào đang nhận lệnh để điều khiển thiết bị tương ứng
  
  // 1. Điều khiển LED (Node.js gửi 1/0 vào home/led/request)
  if (strcmp(topic, MQTT_TOPIC_LED_REQ) == 0) {
    if (message == "1") {
      digitalWrite(LED_LDR, HIGH);
      stateLed = true;
    } else if (message == "0") {
      digitalWrite(LED_LDR, LOW);
      stateLed = false;
    }
    client.publish(MQTT_TOPIC_LED_RES, stateLed ? "1" : "0");
  }
  
  // 2. Điều khiển FAN (Node.js gửi 1/0 vào home/fan/request)
  else if (strcmp(topic, MQTT_TOPIC_FAN_REQ) == 0) {
    if (message == "1") {
      digitalWrite(LED_TEMP, HIGH);
      stateFan = true;
    } else if (message == "0") {
      digitalWrite(LED_TEMP, LOW);
      stateFan = false;
    }
    client.publish(MQTT_TOPIC_FAN_RES, stateFan ? "1" : "0");
  }
  
  // 3. Điều khiển AIR CONDITIONER (Node.js gửi 1/0 vào home/air_conditioner/request)
  else if (strcmp(topic, MQTT_TOPIC_AIR_REQ) == 0) {
    if (message == "1") {
      digitalWrite(LED_HUM, HIGH);
      stateAir = true;
    } else if (message == "0") {
      digitalWrite(LED_HUM, LOW);
      stateAir = false;
    }
    client.publish(MQTT_TOPIC_AIR_RES, stateAir ? "1" : "0");
  }
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    String clientId = "ESP8266Client-";
    clientId += String(random(0xffff), HEX);
    
    if (client.connect(clientId.c_str(), mqtt_user, mqtt_pwd)) {
      Serial.println("connected");
      // Đăng ký nhận bản tin từ 3 topic tương ứng của backend
      client.subscribe(MQTT_TOPIC_LED_REQ);
      client.subscribe(MQTT_TOPIC_FAN_REQ);
      client.subscribe(MQTT_TOPIC_AIR_REQ);
      Serial.println("Subscribed to control topics");
      client.publish(MQTT_TOPIC_DEVICE_ONLINE, clientId.c_str());
      Serial.println("Published device online event");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000); 
    }
  }
}

void setup() {
  Serial.begin(115200);

  // Cài đặt chân OUTPUT
  pinMode(LED_TEMP, OUTPUT);
  pinMode(LED_HUM, OUTPUT);
  pinMode(LED_LDR, OUTPUT);

  // Đảm bảo thiết bị tắt khi khởi động
  digitalWrite(LED_TEMP, LOW);
  digitalWrite(LED_HUM, LOW);
  digitalWrite(LED_LDR, LOW);

  dht.begin();
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  unsigned long currentMillis = millis();

  /* ===== XỬ LÝ ĐỌC CẢM BIẾN (MỖI 2 GIÂY) ===== */
  if (currentMillis - lastSensorReadTime >= sensorInterval) {
    lastSensorReadTime = currentMillis;

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int lightValue = analogRead(LDR_PIN);

    if (isnan(h) || isnan(t)) {
      Serial.println(F("Lỗi: Không thể đọc dữ liệu từ DHT11!"));
    } else {
      // Tạo chuỗi JSON gửi lên server
      String payload = "{";
      payload += "\"temperature\":" + String(t) + ",";
      payload += "\"humidity\":" + String(h) + ",";
      payload += "\"light_level\":" + String(lightValue);
      payload += "}";

      if (client.connected()) {
        client.publish(MQTT_TOPIC_DATA, payload.c_str());
      }
      Serial.println("Publish MQTT: " + payload);
    }
  }
}

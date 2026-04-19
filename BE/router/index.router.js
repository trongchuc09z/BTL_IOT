const {
  controlDevice,
  getHistoryDevice,
  getHistoryDataSensor,
  getHistoryDataSensorForChart,
  getLatestDeviceStatus,
  getDeviceStats,
} = require("../controller/HomeController");

module.exports = (app) => {
  /**
   * @swagger
   * components:
   *   schemas:
   *     ControlDevice:
   *       type: object
   *       properties:
   *         data:
   *           type: String
   *           description: The status of the device
   *         status:
   *           type: Int
   *           description: The status of response api
   *     HistoryDevice:
   *       type: object
   *       properties:
   *         data:
   *           type: object
   *           properties:
   *            Id:
   *             type: Int
   *             description: The ID of the device
   *            Device:
   *              type: String
   *              description: The name of the device
   *            Status:
   *              type: String
   *              description: The status of the device
   *            Time:
   *              type: DateTime
   *              description: The time of the device action
   *           description: The list of device history.
   *         meta:
   *           type: object
   *           properties:
   *             current_page:
   *               type: Int
   *               description: The current page number
   *             page_size:
   *               type: Int
   *               description: The total number of pages
   *             total_page:
   *               type: Int
   *               description: The total number of pages
   *             total_data:
   *               type: Int
   *               description: The total number of data
   *             skip:
   *              type: Int
   *              description: The number of data to skip
   *           description: The Pagination Object
   *     SensorData:
   *       type: object
   *       properties:
   *         data:
   *           type: object
   *           properties:
   *            Id:
   *             type: Int
   *             description: The ID of the history data
   *            Temperature:
   *              type: Float
   *              description: the temperature value
   *            Humidity:
   *              type: Float
   *              description: The humidity of the device
   *            Light:
   *              type: Float
   *              description: The Light of the device
   *            Time:
   *              type: DateTime
   *              description: The time of the get history data
   *           description: The list of device history.
   *         meta:
   *           type: object
   *           properties:
   *             current_page:
   *               type: Int
   *               description: The current page number
   *             page_size:
   *               type: Int
   *               description: The total number of pages
   *             total_page:
   *               type: Int
   *               description: The total number of pages
   *             total_data:
   *               type: Int
   *               description: The total number of data
   *             skip:
   *              type: Int
   *              description: The number of data to skip
   *           description: the pagination object
   */

  /**
   * @swagger
   * /api/device_controller:
   *   post:
   *     summary: Control a device
   *     description: Sends a command to control a device
   *     parameters:
   *       - in: query
   *         name: parameter
   *         schema:
   *           type: string
   *         required: true
   *         description: The parameter for the device control
   *       - in: query
   *         name: id
   *         schema:
   *           type: integer
   *         required: true
   *         description: The ID of the device
   *     responses:
   *       200:
   *         description: Command executed successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ControlDevice'
   */
  app.post("/api/device_controller", controlDevice);

  /**
   * @swagger
   * /api/get_history_device:
   *   get:
   *     summary: Get device history
   *     description: Retrieve the history of device actions
   *     parameters:
   *       - in: query
   *         name: typeSearch
   *         schema:
  *           type: string
  *           enum: [Time, Device, Status, Action]
   *         required: true
  *         description: Search target column
  *       - in: query
  *         name: value
  *         schema:
  *           type: string
  *         description: Search keyword; optional when listing all data
  *       - in: query
  *         name: deviceFilter
  *         schema:
  *           type: string
  *         description: Exact filter for device name (Led, Fan, Air Conditioner, Buzzer, Pump)
  *       - in: query
  *         name: actionFilter
  *         schema:
  *           type: string
  *           enum: [Turn On, Turn Off]
  *         description: Exact filter for action
  *       - in: query
  *         name: statusFilter
  *         schema:
  *           type: string
  *           enum: [Success, Waiting, Failed]
  *         description: Exact filter for command status
   *       - in: query
   *         name: typeSort
   *         schema:
  *           type: string
  *           enum: [Time, Device, Action, Status]
  *         description: Sort target column
   *       - in: query
   *         name: sort
   *         schema:
  *           type: string
  *           enum: [Increase, Decrease]
  *         description: Sorting direction
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
  *           minimum: 1
   *         description: The page number for pagination
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
  *           minimum: 1
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: History fetched successfully
   *         content:
   *           application/json:
   *             schema:
  *               $ref: '#/components/schemas/HistoryDevice'
   */
  app.get("/api/get_history_device", getHistoryDevice);

  /**
   * @swagger
   * /api/get_history_data_sensor:
   *   get:
   *     summary: Get sensor data history
   *     description: Retrieve the history of sensor data
   *     parameters:
   *       - in: query
   *         name: typeSearch
   *         schema:
  *           type: string
  *           enum: [Time, Value, Light, Humidity, Temperature]
   *         required: true
  *         description: Search target sensor field
  *       - in: query
  *         name: value
  *         schema:
  *           type: string
  *         description: Search keyword/value
   *       - in: query
   *         name: typeSort
   *         schema:
  *           type: string
  *           enum: [Time, Temperature, Humidity, Light]
  *         description: Sort target column
   *       - in: query
   *         name: sort
   *         schema:
  *           type: string
  *           enum: [Increase, Decrease]
  *         description: Sorting direction
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
  *           minimum: 1
   *         description: The page number for pagination
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
  *           minimum: 1
   *         description: Number of items per page
   *     responses:
   *       200:
   *         description: Data fetched successfully
   *         content:
   *           application/json:
   *             schema:
  *               $ref: '#/components/schemas/SensorData'
   */
  app.get("/api/get_history_data_sensor", getHistoryDataSensor);

  /**
   * @swagger
   * /api/get_history_data_sensor_for_chart:
   *   get:
   *     summary: Get sensor data for chart
   *     description: Retrieve sensor data specifically for chart display
   *     responses:
   *       200:
   *         description: Chart data fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/SensorData'
   */
  app.get(
    "/api/get_history_data_sensor_for_chart",
    getHistoryDataSensorForChart
  );

  /**
   * @swagger
   * /api/get_latest_device_status:
   *   get:
   *     summary: Get latest device status
   *     description: Retrieve the newest status of all controlled devices
   *     responses:
   *       200:
   *         description: Latest device status fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  app.get("/api/get_latest_device_status", getLatestDeviceStatus);

  /**
   * @swagger
   * /api/get_device_stats:
   *   get:
   *     summary: Get device toggle statistics
   *     description: Retrieve the number of on/off actions per device per day
   *     parameters:
   *       - in: query
   *         name: dateFrom
   *         schema:
   *           type: string
   *         required: true
   *         description: Start date (YYYY-MM-DD)
   *       - in: query
   *         name: dateTo
   *         schema:
   *           type: string
   *         required: true
   *         description: End date (YYYY-MM-DD)
   *     responses:
   *       200:
   *         description: Device stats fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   */
  app.get("/api/get_device_stats", getDeviceStats);
};

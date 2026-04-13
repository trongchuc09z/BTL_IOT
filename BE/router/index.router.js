// Fix duplicate import
const {
  controlDevice,
  getHistoryDevice,
  getHistoryDataSensor,
  getHistoryDataSensorForChart,
  getLatestDeviceStatus,
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
   *         required: true
   *         description: The type of search (Device, Time, Status)
   *       - in: query
   *         name: typeSort
   *         schema:
   *           type: string
   *         description: The type of sort to apply(Time)
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *         description: Sorting order ( Increase, Decrease)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: The page number for pagination
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *       - in: query
   *         name: value
   *         schema:
   *           type: string
   *         description: The value for Search
   *     responses:
   *       200:
   *         description: History fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/HistoryDevice'
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
   *         required: true
   *         description: The type of search to perform(Temperature, Humidity, Light , Time)
   *       - in: query
   *         name: typeSort
   *         schema:
   *           type: string
   *         description: The type of sort to apply(Temperature, Humidity, Light, Time)
   *       - in: query
   *         name: sort
   *         schema:
   *           type: string
   *         description: Sorting order (e.g., Increase, Decrease)
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *         description: The page number for pagination
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *         description: Number of items per page
   *       - in: query
   *         name: value
   *         schema:
   *           type: string
   *         description: The value for search
   *     responses:
   *       200:
   *         description: Data fetched successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                 $ref: '#/components/schemas/SensorData'
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
};

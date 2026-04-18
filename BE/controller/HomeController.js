const statusLedRequest = "home/led/request";
const statusFanRequest = "home/fan/request";
const statusAirConditionerRequest = "home/air_conditioner/request";
const statusBuzzerRequest = "home/buzzer/request";
const statusPumpRequest = "home/pump/request";
const { client } = require("../config/connectMqtt");
const pagination = require("../helper/pagination");
const {
  getHistoryDeviceByTime,
  getHistoryDeviceByDevice,
  getHistoryDeviceByStatus,
  getHistoryDeviceByAction,
  getAllHistoryDevice,
  getCountAllHistoryDevice,
  getCountHistoryDeviceByTime,
  getCountHistoryDeviceByDevice,
  getCountHistoryDeviceByStatus,
  getCountHistoryDeviceByAction,
  getLatestDeviceStatusService,
  schedulePendingHistorySave,
  getDeviceStatsService,
} = require("../service/history_device.service");
const {
  getCountAllHistoryDataSensor,
  getAllHistoryDataSensor,
  getCountHistoryDataSensorByTime,
  getHistoryDataSensorByTime,
  getCountHistoryDataSensorByValue,
  getHistoryDataSensorByValue,
  getCountHistoryDataSensorByLight,
  getHistoryDataSensorByLight,
  getCountHistoryDataSensorByHumidity,
  getHistoryDataSensorByHumidity,
  getCountHistoryDataSensorByTemperature,
  getHistoryDataSensorByTemperature,
  getDataSensorForChart,
} = require("../service/data_sensor.service");
const controlDevice = async (req, res) => {
  const parameter = req.query.parameter;
  const id = req.query.id;
  const data = {};
  let deviceName = "";
  if (id == "1") {
    deviceName = "Led";
    if (parameter == "1") {
      client.publish(statusLedRequest, "1");
      data.status = 200;
      data.data = "led is on";
    } else {
      client.publish(statusLedRequest, "0");
      data.status = 200;
      data.data = "led is off";
    }
  }
  if (id == "2") {
    deviceName = "Fan";
    if (parameter == "1") {
      client.publish(statusFanRequest, "1");
      data.status = 200;
      data.data = "Fan is on";
    } else {
      client.publish(statusFanRequest, "0");
      data.status = 200;
      data.data = "Fan is off";
    }
  }
  if (id == "3") {
    deviceName = "Air Conditioner";
    if (parameter == "1") {
      client.publish(statusAirConditionerRequest, "1");
      data.status = 200;
      data.data = "Air Conditioner  is on";
    } else {
      client.publish(statusAirConditionerRequest, "0");
      data.status = 200;
      data.data = "Air Conditioner  is off";
    }
  }
  if (id == "4") {
    deviceName = "Buzzer";
    if (parameter == "1") {
      client.publish(statusBuzzerRequest, "1");
      data.status = 200;
      data.data = "Buzzer is on";
    } else {
      client.publish(statusBuzzerRequest, "0");
      data.status = 200;
      data.data = "Buzzer is off";
    }
  }
  if (id == "5") {
    deviceName = "Pump";
    if (parameter == "1") {
      client.publish(statusPumpRequest, "1");
      data.status = 200;
      data.data = "Pump is on";
    } else {
      client.publish(statusPumpRequest, "0");
      data.status = 200;
      data.data = "Pump is off";
    }
  }

  if (data.status === 200 && deviceName) {
    const historyResponse = await schedulePendingHistorySave(deviceName, parameter, 10000);
    if (historyResponse.status !== 200) {
      data.status = 500;
      data.data = "Failed to save pending history";
    }
  }

  res.status(data.status).json(data);
};
const getHistoryDevice = async (req, res) => {
  //value
  //typeSearch --
  //typeSort
  //sort
  // page
  //pageSize
  const value = (req.query.value || "").trim();
  const deviceFilter = (req.query.deviceFilter || "").trim();
  const actionFilter = (req.query.actionFilter || "").trim();
  const statusFilter = (req.query.statusFilter || "").trim();
  const typeSearch = (req.query.typeSearch || "").replace(/\s+/g, "");
  const typeSort = (req.query.typeSort || "").replace(/\s+/g, "");
  const sort = (req.query.sort || "").replace(/\s+/g, "");
  const page = (req.query.page || "").replace(/\s+/g, "");
  const pageSize = (req.query.pageSize || "").replace(/\s+/g, "");

  const query = req.query;
  console.log(query);
  const objectPagination = {};
  const data = { status: null, data: null, meta: null };
  const historyFilters = { deviceFilter, actionFilter, statusFilter };
  if (typeSearch == "Time") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice(historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta, historyFilters);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByTime(value, historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDeviceByTime(
        value,
        typeSort,
        sort,
        meta,
        historyFilters
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Device") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice(historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );

      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta, historyFilters);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByDevice(value, historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );

      const dataResponse = await getHistoryDeviceByDevice(
        value,
        typeSort,
        sort,
        meta,
        historyFilters
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Status") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice(historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta, historyFilters);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByStatus(value, historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDeviceByStatus(
        value,
        typeSort,
        sort,
        meta,
        historyFilters
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Action") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice(historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta, historyFilters);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByAction(value, historyFilters)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDeviceByAction(
        value,
        typeSort,
        sort,
        meta,
        historyFilters
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  const { status, ...responseData } = data;
  res.status(data.status).json(responseData);
  console.log(responseData);
};
const getHistoryDataSensor = async (req, res) => {
  //value
  //typeSearch --
  //typeSort
  //sort
  // page
  //pageSize
  const value = (req.query.value || "").trim();
  const typeSearch = (req.query.typeSearch || "").replace(/\s+/g, "");
  const typeSort = (req.query.typeSort || "").replace(/\s+/g, "");
  const sort = (req.query.sort || "").replace(/\s+/g, "");
  const page = (req.query.page || "").replace(/\s+/g, "");
  const pageSize = (req.query.pageSize || "").replace(/\s+/g, "");

  const query = req.query;
  console.log(query);
  const objectPagination = {};
  const data = { status: null, data: null, meta: null };
  if (typeSearch == "Time") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDataSensor()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDataSensor(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDataSensorByTime(value)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDataSensorByTime(
        value,
        typeSort,
        sort,
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Value") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDataSensor()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDataSensor(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDataSensorByValue(value)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDataSensorByValue(
        value,
        typeSort,
        sort,
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Light") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDataSensor()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );

      const dataResponse = await getAllHistoryDataSensor(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDataSensorByLight(value)).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );

      const dataResponse = await getHistoryDataSensorByLight(
        value,
        typeSort,
        sort,
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Humidity") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDataSensor()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDataSensor(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDataSensorByHumidity(value))
        .data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDataSensorByHumidity(
        value,
        typeSort,
        sort,
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Temperature") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDataSensor()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDataSensor(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDataSensorByTemperature(value))
        .data;
      //console.log("total_data is ", total_data);
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getHistoryDataSensorByTemperature(
        value,
        typeSort,
        sort,
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  const { status, ...responseData } = data;
  res.status(status).json(responseData);
  console.log(responseData);
};
const getHistoryDataSensorForChart = async (req, res) => {
  const data = await getDataSensorForChart();
  const { status, ...responseData } = data;
  res.status(data.status).json(responseData.data);
  // console.log(responseData.data);
};
const getLatestDeviceStatus = async (req, res) => {
  const data = await getLatestDeviceStatusService();
  const { status, ...responseData } = data;
  res.status(data.status).json(responseData);
};
const getDeviceStats = async (req, res) => {
  const dateFrom = req.query.dateFrom;
  const dateTo = req.query.dateTo;
  if (!dateFrom || !dateTo) {
    return res.status(400).json({ error: "dateFrom and dateTo are required" });
  }
  const data = await getDeviceStatsService(dateFrom, dateTo);
  const { status, ...responseData } = data;
  res.status(data.status).json(responseData);
};
module.exports = {
  controlDevice,
  getHistoryDevice,
  getHistoryDataSensor,
  getHistoryDataSensorForChart,
  getLatestDeviceStatus,
  getDeviceStats,
};

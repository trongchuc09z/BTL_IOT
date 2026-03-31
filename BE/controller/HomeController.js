const statusLedRequest = "home/led/request";
const statusFanRequest = "home/fan/request";
const { client } = require("../config/connectMqtt");
const statusAirConditionerRequest = "home/air_conditioner/request";
const pagination = require("../helper/pagination");
const {
  getHistoryDeviceByTime,
  getHistoryDeviceByDevice,
  getHistoryDeviceByStatus,
  getAllHistoryDevice,
  getCountAllHistoryDevice,
  getCountHistoryDeviceByTime,
  getCountHistoryDeviceByDevice,
  getCountHistoryDeviceByStatus,
  getFanService,
} = require("../service/history_device.service");
const {
  getCountAllHistoryDataSensor,
  getAllHistoryDataSensor,
  getCountHistoryDataSensorByTime,
  getHistoryDataSensorByTime,
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
  if (id == "1") {
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

  //  console.log(parameter);

  res.status(data.status).json(data);
};
const getHistoryDevice = async (req, res) => {
  //value
  //typeSearch --
  //typeSort
  //sort
  // page
  //pageSize
  const value = (req.query.value || "").replace(/\s+/g, "");
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
    // giá trị tìm kiếm không có gì thì get cả

    //lay

    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByTime(value)).data;
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
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Device") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );

      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByDevice(value)).data;
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
        meta
      );
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    }
  }
  if (typeSearch == "Status") {
    if (value == "" || value == null) {
      const total_data = (await getCountAllHistoryDevice()).data;
      const meta = pagination(
        objectPagination,
        parseInt(page),
        parseInt(pageSize),
        total_data
      );
      const dataResponse = await getAllHistoryDevice(typeSort, sort, meta);
      data.status = dataResponse.status;
      data.data = dataResponse.data;
      data.meta = meta;
    } else {
      const total_data = (await getCountHistoryDeviceByStatus(value)).data;
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
        meta
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
  const value = (req.query.value || "").replace(/\s+/g, "");
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
const getFan = async (req, res) => {
  const data = await getFanService();
  const { status, ...responseData } = data;
  res.status(data.status).json(responseData);
};
module.exports = {
  controlDevice,
  getHistoryDevice,
  getHistoryDataSensor,
  getHistoryDataSensorForChart,
  getFan,
};

const db = require("../model/index");
const { Op, or, Sequelize } = require("sequelize");

const saveDataSensor = async (data) => {
  var response = { status: null };
  try {
    let now = new Date();
    now.setHours(now.getHours() + 7); // Cộng thêm 7 giờ để điều chỉnh múi giờ

    await db.DataSensor.create({
      Temperature: data.temperature,
      Humidity: data.humidity,
      Light: data.light_level,
      Time: now,
    });
    response.status = 200;
  } catch (err) {
    console.log("Lỗi khi insert dữ liệu data sensor", err);
    response.status = 500;
  }
  return response;
};
const getCountAllHistoryDataSensor = async () => {
  const data = { data: null, status: null };
  try {
    const count = await db.DataSensor.count();
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("loi o tim kiem khong can gia tri + service", error);
    data.status = 500;
  }
  return data;
};

const getAllHistoryDataSensor = async (typeSort, sort, meta) => {
  const data = { data: null, status: null };
  order = [];
  order = [];
  if (typeSort == "Time") {
    if (sort == "Increase") {
      order = [["Time", "ASC"]];
    } else {
      order = [["Time", "DESC"]];
    }
  } else if (typeSort == "Temperature") {
    if (sort == "Increase") {
      order = [["Temperature", "ASC"]];
    } else {
      order = [["Temperature", "DESC"]];
    }
  } else if (typeSort == "Humidity") {
    if (sort == "Increase") {
      order = [["Humidity", "ASC"]];
    } else {
      order = [["Humidity", "DESC"]];
    }
  } else if (typeSort == "Light") {
    if (sort == "Increase") {
      order = [["Light", "ASC"]];
    } else {
      order = [["Light", "DESC"]];
    }
  }

  try {
    const objectSearch = await db.DataSensor.findAll({
      raw: true,
      offset: meta.skip,
      limit: meta.page_size,
      order: order,
    });
    if (objectSearch.length > 0) {
      data.status = 200;
      data.data = objectSearch;
    } else {
      data.status = 404;
    }
  } catch (error) {
    console.log("loi khi search du lieu", error);
    data.status = 500;
  }
  console.log(data);
  return data;
};
const getCountHistoryDataSensorByTime = async (value) => {
  var data = {};

  if (value) {
    const day = new Date(value);
    day.setHours(day.getHours() + 7);
    console.log(day);
    let find = {};
    const isDateOnly = value.length === 10;
    if (isDateOnly) {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      console.log(day);
      console.log(nextDay);
      find = {
        Time: {
          [Op.between]: [day, nextDay],
        },
      };
    } else {
      find = {
        Time: {
          [Op.eq]: day,
        },
      };
    }
    try {
      const count = await db.DataSensor.count({
        where: find,
      });
      data.status = 200;
      data.data = count;
    } catch (error) {
      console.log("Error fetching data", error);
      data.status = 500;
    }
  } else {
    data.status = 400;
  }

  return data;
};
const getHistoryDataSensorByTime = async (value, typeSort, sort, meta) => {
  const data = { data: null, status: null };
  try {
    const day = new Date(value);
    day.setHours(day.getHours() + 7);
    console.log(day);
    let find = {};
    const isDateOnly = value.length === 10;
    if (isDateOnly) {
      const nextDay = new Date(day);
      nextDay.setDate(day.getDate() + 1);
      console.log(day);
      console.log(nextDay);
      find = {
        Time: {
          [Op.between]: [day, nextDay],
        },
      };
    } else {
      find = {
        Time: {
          [Op.eq]: day,
        },
      };
    }
    var objectSearchByTime = {};
    order = [];
    if (typeSort == "Time") {
      if (sort == "Increase") {
        order = [["Time", "ASC"]];
      } else {
        order = [["Time", "DESC"]];
      }
    } else if (typeSort == "Temperature") {
      if (sort == "Increase") {
        order = [["Temperature", "ASC"]];
      } else {
        order = [["Temperature", "DESC"]];
      }
    } else if (typeSort == "Humidity") {
      if (sort == "Increase") {
        order = [["Humidity", "ASC"]];
      } else {
        order = [["Humidity", "DESC"]];
      }
    } else if (typeSort == "Light") {
      if (sort == "Increase") {
        order = [["Light", "ASC"]];
      } else {
        order = [["Light", "DESC"]];
      }
    }
    try {
      objectSearchByTime = await db.DataSensor.findAll({
        where: find,
        order: order,
        limit: meta.page_size,
        offset: meta.skip,
        raw: true,
      });
      if (objectSearchByTime.length > 0) {
        data.status = 200;
        data.data = objectSearchByTime;
      } else {
        data.status = 404;
      }
    } catch (error) {
      console.log("loi khi search du lieu", error);
      data.status = 500;
    }
  } catch (error) {
    console.log("Error fetching data", error);
    data.status = 500;
  }
  return data;
};
const getCountHistoryDataSensorByLight = async (value) => {
  const data = { data: null, status: null };
  try {
    const count = await db.DataSensor.count({
      where: {
        Light: {
          [Op.between]: [parseFloat(value) - 0.1, parseFloat(value) + 0.1],
        },
      },
    });
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("loi o tim kiem khong can gia tri + service", error);
    data.status = 500;
  }
  return data;
};
const getHistoryDataSensorByLight = async (value, typeSort, sort, meta) => {
  const data = { data: null, status: null };
  try {
    var objectSearchByLight = {};
    order = [];
    if (typeSort == "Time") {
      if (sort == "Increase") {
        order = [["Time", "ASC"]];
      } else {
        order = [["Time", "DESC"]];
      }
    } else if (typeSort == "Temperature") {
      if (sort == "Increase") {
        order = [["Temperature", "ASC"]];
      } else {
        order = [["Temperature", "DESC"]];
      }
    } else if (typeSort == "Humidity") {
      if (sort == "Increase") {
        order = [["Humidity", "ASC"]];
      } else {
        order = [["Humidity", "DESC"]];
      }
    } else if (typeSort == "Light") {
      if (sort == "Increase") {
        order = [["Light", "ASC"]];
      } else {
        order = [["Light", "DESC"]];
      }
    }
    const valueAsFloat = parseFloat(value);
    objectSearchByLight = await db.DataSensor.findAll({
      where: {
        Light: {
          [Op.between]: [
            Sequelize.literal(valueAsFloat - 0.1),
            Sequelize.literal(valueAsFloat + 0.1),
          ],
        },
      },
      order: order,
      limit: meta.page_size,
      offset: meta.skip,
      raw: true,
    });

    //console.log(objectSearchByLight);
    if (objectSearchByLight.length > 0) {
      data.status = 200;
      data.data = objectSearchByLight;
    } else {
      data.status = 404;
    }
  } catch (error) {
    console.log("loi khi search du lieu", error);
    data.status = 500;
  }
  return data;
};
const getCountHistoryDataSensorByHumidity = async (value) => {
  const data = { data: null, status: null };
  try {
    const count = await db.DataSensor.count({
      where: {
        Humidity: {
          [Op.between]: [parseFloat(value) - 0.1, parseFloat(value) + 0.1],
        },
      },
    });
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("loi o tim kiem khong can gia tri + service", error);
    data.status = 500;
  }
  return data;
};
const getHistoryDataSensorByHumidity = async (value, typeSort, sort, meta) => {
  const data = { data: null, status: null };
  try {
    var objectSearchByHumidity = {};
    order = [];
    if (typeSort == "Time") {
      if (sort == "Increase") {
        order = [["Time", "ASC"]];
      } else {
        order = [["Time", "DESC"]];
      }
    } else if (typeSort == "Temperature") {
      if (sort == "Increase") {
        order = [["Temperature", "ASC"]];
      } else {
        order = [["Temperature", "DESC"]];
      }
    } else if (typeSort == "Humidity") {
      if (sort == "Increase") {
        order = [["Humidity", "ASC"]];
      } else {
        order = [["Humidity", "DESC"]];
      }
    } else if (typeSort == "Light") {
      if (sort == "Increase") {
        order = [["Light", "ASC"]];
      } else {
        order = [["Light", "DESC"]];
      }
    }
    objectSearchByHumidity = await db.DataSensor.findAll({
      where: {
        Humidity: {
          [Op.between]: [parseFloat(value) - 0.1, parseFloat(value) + 0.1],
        },
      },
      order: order,
      limit: meta.page_size,
      offset: meta.skip,
      raw: true,
    });
    if (objectSearchByHumidity.length > 0) {
      data.status = 200;
      data.data = objectSearchByHumidity;
    } else {
      data.status = 404;
    }
  } catch (error) {
    console.log("loi khi search du lieu", error);
    data.status = 500;
  }
  return data;
};
const getCountHistoryDataSensorByTemperature = async (value) => {
  const data = { data: null, status: null };
  try {
    const count = await db.DataSensor.count({
      where: {
        Temperature: {
          [Op.between]: [parseFloat(value) - 0.1, parseFloat(value) + 0.1],
        },
      },
    });
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("loi o tim kiem khong can gia tri + service", error);
    data.status = 500;
  }
  console.log(data);
  return data;
};
const getHistoryDataSensorByTemperature = async (
  value,
  typeSort,
  sort,
  meta
) => {
  const data = { data: null, status: null };
  try {
    var objectSearchByTemperature = {};
    order = [];
    if (typeSort == "Time") {
      if (sort == "Increase") {
        order = [["Time", "ASC"]];
      } else {
        order = [["Time", "DESC"]];
      }
    } else if (typeSort == "Temperature") {
      if (sort == "Increase") {
        order = [["Temperature", "ASC"]];
      } else {
        order = [["Temperature", "DESC"]];
      }
    } else if (typeSort == "Humidity") {
      if (sort == "Increase") {
        order = [["Humidity", "ASC"]];
      } else {
        order = [["Humidity", "DESC"]];
      }
    } else if (typeSort == "Light") {
      if (sort == "Increase") {
        order = [["Light", "ASC"]];
      } else {
        order = [["Light", "DESC"]];
      }
    }
    objectSearchByTemperature = await db.DataSensor.findAll({
      where: {
        Temperature: {
          [Op.between]: [parseFloat(value) - 0.1, parseFloat(value) + 0.1],
        },
      },
      order: order,
      limit: meta.page_size,
      offset: meta.skip,
      raw: true,
    });

    if (objectSearchByTemperature.length > 0) {
      data.status = 200;
      data.data = objectSearchByTemperature;
    } else {
      data.status = 404;
    }
  } catch (error) {
    console.log("loi khi search du lieu", error);
    data.status = 500;
  }
  return data;
};
const getDataSensorForChart = async () => {
  const attribute = ["Temperature", "Humidity", "Light", "Time"];
  const data = { data: null, status: null };
  try {
    const rows = await db.DataSensor.findAll({
      attributes: attribute,
      limit: 10,
      order: [["Time", "DESC"]],
    });
    data.status = 200;
    data.data = rows;
  } catch (error) {
    console.log(
      "Lỗi khi truy vấn 5 hàng cuối cùng với thuộc tính Temperature",
      error
    );
    data.status = 500;
  }
  console.log(data);
  return data;
};
module.exports = {
  saveDataSensor,
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
};

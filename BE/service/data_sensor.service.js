const db = require("../model/index");
const { Op, or, Sequelize } = require("sequelize");

// Cập nhật lại logic cho hàm saveDataSensor (chỉ ghi đè hàm này, giữ nguyên các hàm khác)
const saveDataSensor = async (data) => {
  let response = { status: null };
  try {
    let now = new Date();

    // Tách 3 thông số ra để lưu thành 3 bản ghi độc lập
    const metrics = [
      { name: "Temperature", value: data.temperature },
      { name: "Humidity", value: data.humidity },
      { name: "Light", value: data.light_level }
    ];

    for (let metric of metrics) {
      // Tìm id của loại cảm biến trong bảng 'sensor' (nếu chưa có thì tự động tạo)
      const [sensorObj, created] = await db.Sensor.findOrCreate({
        where: { name: metric.name }
      });

      // Lưu giá trị vào bảng 'datasensor' tương ứng với id_ss
      await db.DataSensor.create({
        id_ss: sensorObj.id,
        value: metric.value,
        date_time: now,
      });
    }
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
  const data = { data: null, status: null };
  try {
    // 1. Lấy 10 mốc thời gian gần nhất (vì 3 chỉ số lưu cùng 1 thời điểm)
    const latestTimes = await db.DataSensor.findAll({
      attributes: ['date_time'],
      group: ['date_time'],
      order: [['date_time', 'DESC']],
      limit: 10
    });

    const timeArray = latestTimes.map(t => t.date_time);

    // 2. Lấy toàn bộ bản ghi thuộc 10 mốc thời gian này, JOIN với bảng Sensor để lấy tên
    const rawData = await db.DataSensor.findAll({
      where: { date_time: timeArray },
      include: [{ model: db.Sensor, attributes: ['name'] }],
      order: [['date_time', 'DESC']]
    });

    // 3. Gom nhóm 3 dòng (Nhiệt, Ẩm, Sáng) thành 1 object duy nhất cho Frontend
    let groupedData = {};
    rawData.forEach(item => {
      // Dùng thời gian làm key để gom nhóm
      const timeStr = new Date(item.date_time).getTime();
      if (!groupedData[timeStr]) {
        groupedData[timeStr] = { Time: item.date_time };
      }
      // Gán giá trị theo tên cảm biến (Temperature, Humidity, Light)
      groupedData[timeStr][item.Sensor.name] = item.value;
    });

    data.status = 200;
    // Chuyển object thành array và trả về
    data.data = Object.values(groupedData);
  } catch (error) {
    console.log("Lỗi khi truy vấn chart sensor", error);
    data.status = 500;
  }
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

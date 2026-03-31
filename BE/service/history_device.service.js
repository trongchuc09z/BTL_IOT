const db = require("../model/index");
const { Sequelize, or } = require("sequelize");
const { Op } = require("sequelize");
const saveHistoryDevice = async (name, status) => {
  var response = { status: null };
  var statusDevice = status == "1" ? "ON" : "OFF";
  try {
    let now = new Date();
    now.setHours(now.getHours() + 7); // Cộng thêm 7 giờ để điều chỉnh múi giờ

    await db.HistoryDevice.create({
      Device: name,
      Status: statusDevice,
      Time: now,
    });
    response.status = 200;
  } catch (err) {
    console.log("Lỗi khi insert dữ liệu data sensor", err);
    response.status = 500;
  }
  return response;
};
const getCountHistoryDeviceByTime = async (value) => {
  var data = {};
  var find = {};
  if (value) {
    const day = new Date(value);
    day.setHours(day.getHours() + 7);
    //console.log(day);
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
      const count = await db.HistoryDevice.count({
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

  console.log(data);
  return data;
};
const getHistoryDeviceByTime = async (value, typeSort, sort, meta) => {
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
    }
    try {
      objectSearchByTime = await db.HistoryDevice.findAll({
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
    data.data = null;
    data.status = 500;
  }

  //console.log(data);
  return data;
};

const getHistoryDeviceByStatus = async (value, typeSort, sort, meta) => {
  var data = {};
  var find = {};
  if (value) {
    find = {
      Status: {
        [Op.like]: `%${value}%`,
      },
    };
  }
  order = [];
  if (typeSort == "Time") {
    if (sort == "Increase") {
      order = [["Time", "ASC"]];
    } else {
      order = [["Time", "DESC"]];
    }
  }
  try {
    // Truy vấn dữ liệu từ database
    let objectSearchByTime = await db.HistoryDevice.findAll({
      where: find,
      order: order,
      limit: meta.page_size,
      offset: meta.skip,
      raw: true,
    });

    if (objectSearchByTime.length > 0) {
      // Sắp xếp theo thời gian
      if (typeSort === "Time") {
        if (sort === "Increase") {
          objectSearchByTime.sort((a, b) => {
            return new Date(a.Time) - new Date(b.Time);
          });
        } else if (sort === "Decrease") {
          objectSearchByTime.sort((a, b) => {
            return new Date(b.Time) - new Date(a.Time);
          });
        }
      }

      data.status = 200;
      data.data = objectSearchByTime;
    } else {
      data.status = 404;
      data.data = null;
      data.message = "No data found";
    }
  } catch (error) {
    console.log("Error fetching data", error);
    data.status = 500;
    data.message = "Internal server error";
  }

  return data;
};
const getCountHistoryDeviceByStatus = async (value) => {
  var data = {};
  var find = {};
  if (value) {
    find = {
      Status: {
        [Op.like]: `%${value}%`,
      },
    };
  }

  try {
    const count = await db.HistoryDevice.count({
      where: find,
    });
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("Error fetching data", error);
    data.status = 500;
  }

  return data;
};
const getHistoryDeviceByDevice = async (value, typeSort, sort, meta) => {
  var data = {};
  var find = {};
  if (value) {
    find = {
      Device: {
        [Op.like]: `%${value}%`,
      },
    };
  }
  order = [];
  if (typeSort == "Time") {
    if (sort == "Increase") {
      order = [["Time", "ASC"]];
    } else {
      order = [["Time", "DESC"]];
    }
  }
  try {
    // Truy vấn dữ liệu từ database
    let objectSearchByTime = await db.HistoryDevice.findAll({
      where: find,
      order: order,
      limit: meta.page_size,
      offset: meta.skip,
      raw: true,
    });

    if (objectSearchByTime.length > 0) {
      // Sắp xếp theo thời gian
      data.status = 200;
      data.data = objectSearchByTime;
    } else {
      data.status = 404;
    }
  } catch (error) {
    console.log("Error fetching data", error);
    data.status = 500;
  }

  return data;
};
const getCountHistoryDeviceByDevice = async (value) => {
  var data = {};
  var find = {};
  if (value) {
    find = {
      Device: {
        [Op.like]: `%${value}%`,
      },
    };
  }

  try {
    const count = await db.HistoryDevice.count({
      where: find,
    });
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("Error fetching data", error);
    data.status = 500;
  }

  return data;
};
const getAllHistoryDevice = async (typeSort, sort, meta) => {
  const data = { data: null, status: null };
  order = [];
  if (typeSort == "Time") {
    if (sort == "Increase") {
      order = [["Time", "ASC"]];
    } else {
      order = [["Time", "DESC"]];
    }
  }
  try {
    const objectSearch = await db.HistoryDevice.findAll({
      raw: true,
      limit: meta.page_size,
      offset: meta.skip,
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
  return data;
};
const getCountAllHistoryDevice = async () => {
  const data = { data: null, status: null };
  try {
    const count = await db.HistoryDevice.count();
    data.status = 200;
    data.data = count;
  } catch (error) {
    console.log("Error fetching data", error);
    data.status = 500;
  }

  return data;
};

const getFanService = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  startOfDay.setHours(startOfDay.getHours() + 7);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  endOfDay.setHours(endOfDay.getHours() + 7);
  const data = { status: null, data: null };
  try {
    const count = await db.HistoryDevice.count({
      where: {
        Device: "Fan",
        Status: "ON",
        Time: {
          [Op.between]: [startOfDay, endOfDay],
        },
      },
    });
    data.status = 200;
    data.data = count;
  } catch (error) {
    data.status = 500;
  }
  return data;
};

module.exports = {
  getHistoryDeviceByStatus,
  getHistoryDeviceByDevice,
  getHistoryDeviceByTime,
  saveHistoryDevice,
  getAllHistoryDevice,
  getCountAllHistoryDevice,
  getCountHistoryDeviceByTime,
  getCountHistoryDeviceByDevice,
  getCountHistoryDeviceByStatus,
  getFanService,
};

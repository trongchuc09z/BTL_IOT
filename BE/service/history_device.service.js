const db = require("../model/index");
const { Sequelize, or } = require("sequelize");
const { Op } = require("sequelize");
// Cập nhật lại logic cho hàm saveHistoryDevice
const saveHistoryDevice = async (name, status) => {
  let response = { status: null };
  let statusDevice = status == "1" ? "ON" : (status == "0" ? "OFF" : status);
  // Định nghĩa action tương ứng
  let actionDevice = statusDevice === "ON" ? "Turn On" : "Turn Off";

  try {
    let now = new Date();

    // Tìm id của thiết bị trong bảng 'devices' (nếu chưa có thì tự động tạo)
    const [deviceObj, created] = await db.Devices.findOrCreate({
      where: { name: name }
    });

    // Cập nhật trạng thái mới nhất vào bảng devices
    deviceObj.status = statusDevice;
    await deviceObj.save();

    // Lưu vào bảng 'action_history'
    await db.ActionHistory.create({
      device_id: deviceObj.id,
      action: actionDevice,
      status: statusDevice,
      time: now,
    });

    response.status = 200;
  } catch (err) {
    console.log("Lỗi khi insert dữ liệu history device", err);
    response.status = 500;
  }
  return response;
};
const getCountHistoryDeviceByTime = async (value) => {
  var data = {};
  var find = {};
  if (value) {
    const day = new Date(value);
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
// Thay đổi hàm getAllHistoryDevice
const getAllHistoryDevice = async (typeSort, sort, meta) => {
  const data = { data: null, status: null };
  let order = [];
  if (typeSort == "Time") {
    order = [["time", sort == "Increase" ? "ASC" : "DESC"]]; // Sửa 'Time' thành 'time' (theo tên cột mới)
  }
  try {
    const rawData = await db.ActionHistory.findAll({
      include: [{
        model: db.Devices,
        attributes: ['name'] // Lấy cột name từ bảng Devices
      }],
      limit: meta.page_size,
      offset: meta.skip,
      order: order,
    });

    if (rawData.length > 0) {
      data.status = 200;
      // Map lại dữ liệu để trả về format cũ cho Frontend
      data.data = rawData.map(item => ({
        Id: item.id,
        Device: item.Device.name,
        Action: item.action,
        Status: item.status,
        Time: item.time
      }));
    } else {
      data.status = 404;
    }
  } catch (error) {
    console.log("Lỗi khi search dữ liệu device", error);
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

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
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

// Thay đổi hàm getLatestDeviceStatusService (Lấy trạng thái thiết bị mới nhất)
const getLatestDeviceStatusService = async () => {
  const data = { status: null, data: { led: "OFF", fan: "OFF", ac: "OFF" } };
  try {
    // Lấy toàn bộ bản ghi thiết bị từ bảng db.Devices
    const devices = await db.Devices.findAll();

    // Map trạng thái thiết bị
    devices.forEach((device) => {
      const name = (device.name || "").toLowerCase();
      // Gán status theo tên
      if (name.includes('led') || name.includes('đèn')) {
        data.data.led = device.status || "OFF";
      }
      if (name.includes('fan') || name.includes('quạt')) {
        data.data.fan = device.status || "OFF";
      }
      if (name.includes('air') || name.includes('điều') || name.includes('ac')) {
        data.data.ac = device.status || "OFF";
      }
    });

    data.status = 200;
  } catch (error) {
    console.log("Error fetching latest status", error);
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
  getLatestDeviceStatusService,
};

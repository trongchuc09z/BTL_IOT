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
/* Helper Raw Queries */
const executeHistoryCountQuery = async (whereCondition) => {
  const sql = `
    SELECT COUNT(*) as count 
    FROM action_history ah
    JOIN devices d ON ah.device_id = d.id
    ${whereCondition ? 'WHERE ' + whereCondition : ''}
  `;
  const res = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
  return res && res[0] ? res[0].count : 0;
};

const executeHistoryQuery = async (whereCondition, typeSort, sort, meta) => {
  let sortField = typeSort === "Device" ? "d.name" : "ah.time"; // Sắp xếp theo device name hoặc time 
  let sortDirection = sort === "Increase" ? "ASC" : "DESC";
  const limit = meta.page_size;
  const offset = meta.skip;
  
  const sql = `
    SELECT 
      ah.id as Id,
      d.name as Device,
      ah.action as Action,
      ah.status as Status,
      ah.time as Time
    FROM action_history ah
    JOIN devices d ON ah.device_id = d.id
    ${whereCondition ? 'WHERE ' + whereCondition : ''}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const res = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
  return res || [];
};

const getCountHistoryDeviceByTime = async (value) => {
  try {
    const isDateOnly = value.length === 10;
    const cond = isDateOnly ? `DATE(ah.time) = '${value}'` : `ah.time = '${value}'`;
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByTime = async (value, typeSort, sort, meta) => {
  try {
    const isDateOnly = value.length === 10;
    const cond = isDateOnly ? `DATE(ah.time) = '${value}'` : `ah.time = '${value}'`;
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByStatus = async (value, typeSort, sort, meta) => {
  try {
    const cond = `ah.status LIKE '%${value}%' OR ah.action LIKE '%${value}%'`;
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDeviceByStatus = async (value) => {
  try {
    const cond = `ah.status LIKE '%${value}%' OR ah.action LIKE '%${value}%'`;
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByDevice = async (value, typeSort, sort, meta) => {
  try {
    const cond = `d.name LIKE '%${value}%'`;
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDeviceByDevice = async (value) => {
  try {
    const cond = `d.name LIKE '%${value}%'`;
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getAllHistoryDevice = async (typeSort, sort, meta) => {
  try {
    const data = await executeHistoryQuery("", typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountAllHistoryDevice = async () => {
  try {
    const count = await executeHistoryCountQuery("");
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getFanService = async () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  const data = { status: null, data: null };
  try {
    const formattedStart = startOfDay.toISOString().slice(0, 19).replace('T', ' ');
    const formattedEnd = endOfDay.toISOString().slice(0, 19).replace('T', ' ');
    // Truy vấn lịch sử quạt từ bảng ActionHistory kết hợp Devices
    const count = await executeHistoryCountQuery(`
      d.name LIKE '%Fan%' 
      AND (ah.status = 'ON' OR ah.action LIKE '%Turn On%')
      AND ah.time BETWEEN '${formattedStart}' AND '${formattedEnd}'
    `);
    
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

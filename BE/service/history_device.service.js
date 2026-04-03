const db = require("../model/index");
const { Sequelize, or } = require("sequelize");
const { Op } = require("sequelize");
const pendingDeviceCommands = new Map();

const normalizeDeviceStatus = (status) =>
  status == "1" ? "ON" : (status == "0" ? "OFF" : status);

const ensureDeviceRecord = async (name, statusDevice, shouldUpdateStatus = true) => {
  const [deviceObj] = await db.Devices.findOrCreate({
    where: { name: name }
  });

  if (shouldUpdateStatus) {
    deviceObj.status = statusDevice;
    await deviceObj.save();
  }

  return deviceObj;
};

// Cập nhật lại logic cho hàm saveHistoryDevice
const saveHistoryDevice = async (name, status, options = {}) => {
  let response = { status: null };
  let statusDevice = normalizeDeviceStatus(status);
  let actionDevice = statusDevice === "ON" ? "Turn On" : "Turn Off";
  const shouldUpdateStatus = options.updateDeviceStatus !== false;
  const historyStatus = options.historyStatus || "Success";

  try {
    let now = new Date();
    const deviceObj = await ensureDeviceRecord(name, statusDevice, shouldUpdateStatus);

    // Lưu vào bảng 'action_history'
    await db.ActionHistory.create({
      device_id: deviceObj.id,
      action: actionDevice,
      status: historyStatus,
      time: now,
    });

    response.status = 200;
  } catch (err) {
    console.log("Lỗi khi insert dữ liệu history device", err);
    response.status = 500;
  }
  return response;
};

const updateDeviceStatusOnly = async (name, status) => {
  let response = { status: null };
  try {
    const statusDevice = normalizeDeviceStatus(status);
    await ensureDeviceRecord(name, statusDevice);
    response.status = 200;
  } catch (err) {
    console.log("Lỗi khi cập nhật trạng thái thiết bị", err);
    response.status = 500;
  }
  return response;
};

const schedulePendingHistorySave = (name, status, delayMs = 10000) => {
  const statusDevice = normalizeDeviceStatus(status);
  const existingPending = pendingDeviceCommands.get(name);
  if (existingPending) {
    clearTimeout(existingPending.timeoutId);
  }

  const timeoutId = setTimeout(async () => {
    pendingDeviceCommands.delete(name);
    const saveResponse = await saveHistoryDevice(name, statusDevice, {
      updateDeviceStatus: false,
      historyStatus: "Failed",
    });
    console.log(`Fallback save history for ${name}:`, saveResponse);
  }, delayMs);

  pendingDeviceCommands.set(name, {
    status: statusDevice,
    timeoutId,
  });
};

const confirmPendingHistorySave = async (name, status) => {
  const statusDevice = normalizeDeviceStatus(status);
  const existingPending = pendingDeviceCommands.get(name);

  if (!existingPending) {
    return updateDeviceStatusOnly(name, statusDevice);
  }

  clearTimeout(existingPending.timeoutId);
  pendingDeviceCommands.delete(name);
  return saveHistoryDevice(name, statusDevice);
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

const appendDeviceCondition = (condition, deviceFilter) => {
  const trimmedDevice = (deviceFilter || "").trim();
  if (!trimmedDevice) {
    return condition;
  }

  const deviceCondition = `d.name = '${trimmedDevice.replace(/'/g, "''")}'`;
  return condition ? `(${condition}) AND ${deviceCondition}` : deviceCondition;
};

const normalizeTimeSearch = (value) => {
  const trimmedValue = (value || "").trim();
  if (!trimmedValue) {
    return null;
  }

  const hourOnlyMatch = trimmedValue.match(/^(\d{1,2})\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (hourOnlyMatch) {
    const [, hour, day, month, year] = hourOnlyMatch;
    return {
      type: "hour",
      value: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hour.padStart(2, "0")}:00:00`,
    };
  }

  const fullDateTimeMatch = trimmedValue.match(
    /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?\s+(\d{1,2})\/(\d{1,2})\/(\d{4})$/
  );
  if (fullDateTimeMatch) {
    const [, hour, minute, second = "00", day, month, year] = fullDateTimeMatch;
    return {
      type: fullDateTimeMatch[3] ? "datetime" : "minute",
      value: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")} ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}:${second.padStart(2, "0")}`,
    };
  }

  const dateOnlyMatch = trimmedValue.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (dateOnlyMatch) {
    const [, day, month, year] = dateOnlyMatch;
    return {
      type: "date",
      value: `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    };
  }

  const monthOnlyMatch = trimmedValue.match(/^(\d{1,2})\/(\d{4})$/);
  if (monthOnlyMatch) {
    const [, month, year] = monthOnlyMatch;
    return {
      type: "month",
      value: `${year}-${month.padStart(2, "0")}`,
    };
  }

  const yearOnlyMatch = trimmedValue.match(/^(\d{4})$/);
  if (yearOnlyMatch) {
    const [, year] = yearOnlyMatch;
    return {
      type: "year",
      value: year,
    };
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return { type: "date", value: trimmedValue };
  }

  if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
    return { type: "month", value: trimmedValue };
  }

  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(trimmedValue)) {
    return { type: "datetime", value: trimmedValue };
  }

  return { type: trimmedValue.length === 10 ? "date" : "datetime", value: trimmedValue };
};

const buildTimeCondition = (value) => {
  const normalizedTime = normalizeTimeSearch(value);
  if (!normalizedTime) {
    return "";
  }

  if (normalizedTime.type === "date") {
    return `DATE(ah.time) = '${normalizedTime.value}'`;
  }

  if (normalizedTime.type === "month") {
    return `DATE_FORMAT(ah.time, '%Y-%m') = '${normalizedTime.value}'`;
  }

  if (normalizedTime.type === "year") {
    return `YEAR(ah.time) = '${normalizedTime.value}'`;
  }

  if (normalizedTime.type === "hour") {
    const hourValue = normalizedTime.value.slice(0, 13);
    return `ah.time >= '${hourValue}:00:00' AND ah.time < DATE_ADD('${hourValue}:00:00', INTERVAL 1 HOUR)`;
  }

  if (normalizedTime.type === "minute") {
    const minuteValue = normalizedTime.value.slice(0, 16);
    return `ah.time >= '${minuteValue}:00' AND ah.time < DATE_ADD('${minuteValue}:00', INTERVAL 1 MINUTE)`;
  }

  return `ah.time >= '${normalizedTime.value}' AND ah.time < DATE_ADD('${normalizedTime.value}', INTERVAL 1 SECOND)`;
};

const getCountHistoryDeviceByTime = async (value, deviceFilter = "") => {
  try {
    const cond = appendDeviceCondition(buildTimeCondition(value), deviceFilter);
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByTime = async (value, typeSort, sort, meta, deviceFilter = "") => {
  try {
    const cond = appendDeviceCondition(buildTimeCondition(value), deviceFilter);
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByStatus = async (value, typeSort, sort, meta, deviceFilter = "") => {
  try {
    const cond = appendDeviceCondition(`ah.status LIKE '%${value}%' OR ah.action LIKE '%${value}%'`, deviceFilter);
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDeviceByStatus = async (value, deviceFilter = "") => {
  try {
    const cond = appendDeviceCondition(`ah.status LIKE '%${value}%' OR ah.action LIKE '%${value}%'`, deviceFilter);
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByDevice = async (value, typeSort, sort, meta, deviceFilter = "") => {
  try {
    const cond = appendDeviceCondition(`d.name LIKE '%${value}%'`, deviceFilter);
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDeviceByDevice = async (value, deviceFilter = "") => {
  try {
    const cond = appendDeviceCondition(`d.name LIKE '%${value}%'`, deviceFilter);
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getAllHistoryDevice = async (typeSort, sort, meta, deviceFilter = "") => {
  try {
    const data = await executeHistoryQuery(appendDeviceCondition("", deviceFilter), typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountAllHistoryDevice = async (deviceFilter = "") => {
  try {
    const count = await executeHistoryCountQuery(appendDeviceCondition("", deviceFilter));
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
  updateDeviceStatusOnly,
  schedulePendingHistorySave,
  confirmPendingHistorySave,
};

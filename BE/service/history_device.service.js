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
  let response = { status: null, data: null };
  const statusDevice = normalizeDeviceStatus(status);
  const actionDevice = statusDevice === "ON" ? "Turn On" : "Turn Off";
  const shouldUpdateStatus = options.updateDeviceStatus !== false;
  const historyStatus = options.historyStatus || "Success";

  try {
    const now = new Date();
    const deviceObj = await ensureDeviceRecord(name, statusDevice, shouldUpdateStatus);

    // Lưu vào bảng 'action_history'
    const historyEntry = await db.ActionHistory.create({
      device_id: deviceObj.id,
      action: actionDevice,
      status: historyStatus,
      time: now,
    });

    response.status = 200;
    response.data = {
      historyId: historyEntry.id,
      deviceId: deviceObj.id,
      status: historyStatus,
    };
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

const updateHistoryEntry = async (historyId, updates) => {
  let response = { status: null };
  try {
    const [affectedRows] = await db.ActionHistory.update(updates, {
      where: { id: historyId },
    });
    response.status = affectedRows > 0 ? 200 : 404;
  } catch (err) {
    console.log("Lá»—i khi cáº­p nháº­t history device", err);
    response.status = 500;
  }
  return response;
};

const applyResolvedDeviceState = async (name, status, historyId, historyStatus) => {
  try {
    const statusDevice = normalizeDeviceStatus(status);
    const actionDevice = statusDevice === "ON" ? "Turn On" : "Turn Off";
    const shouldUpdateStatus = historyStatus === "Success";
    const deviceObj = await ensureDeviceRecord(name, statusDevice, shouldUpdateStatus);
    // Cập nhật lại trạng thái thiết bị nếu lệnh được xác nhận thành công, nếu thất bại thì giữ nguyên trạng thái cũ

    return await updateHistoryEntry(historyId, { // Cập nhật lại bản ghi lịch sử với device_id, action và status mới
      device_id: deviceObj.id,
      action: actionDevice,
      status: historyStatus,
    });
  } catch (err) {
    console.log("Lá»—i khi Ä‘á»“ng bá»™ history device", err);
    return { status: 500 };
  }
};

const schedulePendingHistorySave = async (name, status, delayMs = 10000) => {
  const statusDevice = normalizeDeviceStatus(status); // Chuẩn hóa trạng thái thiết bị
  const existingPending = pendingDeviceCommands.get(name); // Kiểm tra nếu đã có lệnh đang chờ xử lý cho thiết bị này
  if (existingPending) { // Nếu có, hủy timeout hiện tại và áp dụng trạng thái đã được xác định trước đó (thành công hoặc thất bại)
    clearTimeout(existingPending.timeoutId);
    await applyResolvedDeviceState(
      name,
      existingPending.status,
      existingPending.historyId,
      "Failed"
    );
    pendingDeviceCommands.delete(name);
  }

  const saveResponse = await saveHistoryDevice(name, statusDevice, {
    updateDeviceStatus: false,
    historyStatus: "Waiting",
  });
  if (saveResponse.status !== 200 || !saveResponse.data?.historyId) {
    return saveResponse;
  }

  const historyId = saveResponse.data.historyId;

  const timeoutId = setTimeout(async () => {
    pendingDeviceCommands.delete(name);
    const failureResponse = await applyResolvedDeviceState(
      name,
      statusDevice,
      historyId,
      "Failed"
    );
    console.log(`Fallback save history for ${name}:`, failureResponse);
  }, delayMs);

  pendingDeviceCommands.set(name, {
    status: statusDevice,
    historyId,
    timeoutId,
  });

  return saveResponse;
};

const confirmPendingHistorySave = async (name, status) => {
  const statusDevice = normalizeDeviceStatus(status);
  const existingPending = pendingDeviceCommands.get(name);

  if (!existingPending) {
    return updateDeviceStatusOnly(name, statusDevice);
  }

  clearTimeout(existingPending.timeoutId);
  pendingDeviceCommands.delete(name);
  return applyResolvedDeviceState(
    name,
    statusDevice,
    existingPending.historyId,
    "Success"
  );
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

const escapeSqlValue = (value) => String(value || "").replace(/'/g, "''");

const appendHistoryFilters = (condition, filters = {}) => {
  const conditions = [];
  if (condition) {
    conditions.push(condition);
  }

  const trimmedDevice = (filters.deviceFilter || "").trim();
  if (trimmedDevice) {
    conditions.push(`d.name = '${escapeSqlValue(trimmedDevice)}'`);
  }

  const trimmedAction = (filters.actionFilter || "").trim();
  if (trimmedAction) {
    conditions.push(`ah.action = '${escapeSqlValue(trimmedAction)}'`);
  }

  const trimmedStatus = (filters.statusFilter || "").trim();
  if (trimmedStatus) {
    conditions.push(`ah.status = '${escapeSqlValue(trimmedStatus)}'`);
  }

  return conditions.join(" AND ");
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

const getCountHistoryDeviceByTime = async (value, filters = {}) => {
  try {
    const cond = appendHistoryFilters(buildTimeCondition(value), filters);
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByTime = async (value, typeSort, sort, meta, filters = {}) => {
  try {
    const cond = appendHistoryFilters(buildTimeCondition(value), filters);
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByStatus = async (value, typeSort, sort, meta, filters = {}) => {
  try {
    const escapedValue = escapeSqlValue(value);
    const cond = appendHistoryFilters(
      `(ah.status LIKE '%${escapedValue}%' OR ah.action LIKE '%${escapedValue}%')`,
      filters
    );
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDeviceByStatus = async (value, filters = {}) => {
  try {
    const escapedValue = escapeSqlValue(value);
    const cond = appendHistoryFilters(
      `(ah.status LIKE '%${escapedValue}%' OR ah.action LIKE '%${escapedValue}%')`,
      filters
    );
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDeviceByDevice = async (value, typeSort, sort, meta, filters = {}) => {
  try {
    const cond = appendHistoryFilters(`d.name LIKE '%${escapeSqlValue(value)}%'`, filters);
    const data = await executeHistoryQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDeviceByDevice = async (value, filters = {}) => {
  try {
    const cond = appendHistoryFilters(`d.name LIKE '%${escapeSqlValue(value)}%'`, filters);
    const count = await executeHistoryCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getAllHistoryDevice = async (typeSort, sort, meta, filters = {}) => {
  try {
    const data = await executeHistoryQuery(appendHistoryFilters("", filters), typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountAllHistoryDevice = async (filters = {}) => {
  try {
    const count = await executeHistoryCountQuery(appendHistoryFilters("", filters));
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
  const data = { status: null, data: { led: "OFF", fan: "OFF", ac: "OFF", buzzer: "OFF", pump: "OFF" } };
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
      if (name.includes('buzzer') || name.includes('còi') || name.includes('chuông')) {
        data.data.buzzer = device.status || "OFF";
      }
      if (name.includes('pump') || name.includes('bơm')) {
        data.data.pump = device.status || "OFF";
      }
    });

    data.status = 200;
  } catch (error) {
    console.log("Error fetching latest status", error);
    data.status = 500;
  }
  return data;
};

// Thống kê số lần bật/tắt theo ngày của từng thiết bị
const getDeviceStatsService = async (dateFrom, dateTo) => {
  const data = { status: null, data: [] };
  try {
    const sql = `
      SELECT 
        DATE(ah.time) as date,
        d.name as device,
        SUM(CASE WHEN ah.action = 'Turn On' THEN 1 ELSE 0 END) as count_on,
        SUM(CASE WHEN ah.action = 'Turn Off' THEN 1 ELSE 0 END) as count_off,
        COUNT(*) as count
      FROM action_history ah
      JOIN devices d ON ah.device_id = d.id
      WHERE DATE(ah.time) >= '${dateFrom}'
        AND DATE(ah.time) <= '${dateTo}'
        AND ah.status = 'Success'
      GROUP BY DATE(ah.time), d.name
      ORDER BY DATE(ah.time) ASC, d.name ASC
    `;
    const result = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
    data.data = result.map(row => ({
      date: row.date instanceof Date
        ? row.date.toISOString().slice(0, 10)
        : String(row.date).slice(0, 10),
      device: row.device,
      count: parseInt(row.count),
      count_on: parseInt(row.count_on || 0),
      count_off: parseInt(row.count_off || 0)
    }));
    data.status = 200;
  } catch (error) {
    console.log("Error fetching device stats:", error);
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
  getLatestDeviceStatusService,
  updateDeviceStatusOnly,
  schedulePendingHistorySave,
  confirmPendingHistorySave,
  getDeviceStatsService,
};

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
const executeCountQuery = async (whereCondition) => {
  const sql = `
    SELECT COUNT(*) as count FROM (
      SELECT 
        ds.date_time as Time,
        ROUND(MAX(CASE WHEN s.name = 'Temperature' THEN ds.value END), 2) as Temperature,
        MAX(CASE WHEN s.name = 'Humidity' THEN ds.value END) as Humidity,
        MAX(CASE WHEN s.name = 'Light' THEN ds.value END) as Light
      FROM datasensor ds
      JOIN sensor s ON ds.id_ss = s.id
      GROUP BY ds.date_time
    ) PivotTable
    ${whereCondition ? 'WHERE ' + whereCondition : ''}
  `;
  const res = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
  return res && res[0] ? res[0].count : 0;
};

const executeDataQuery = async (whereCondition, typeSort, sort, meta) => {
  let sortField = typeSort || "Time";
  let sortDirection = sort === "Increase" ? "ASC" : "DESC";
  const limit = meta.page_size;
  const offset = meta.skip;
  
  const sql = `
    SELECT * FROM (
      SELECT 
        MIN(ds.id) as Id,
        ds.date_time as Time,
        ROUND(MAX(CASE WHEN s.name = 'Temperature' THEN ds.value END), 2) as Temperature,
        MAX(CASE WHEN s.name = 'Humidity' THEN ds.value END) as Humidity,
        MAX(CASE WHEN s.name = 'Light' THEN ds.value END) as Light
      FROM datasensor ds
      JOIN sensor s ON ds.id_ss = s.id
      GROUP BY ds.date_time
    ) PivotTable
    ${whereCondition ? 'WHERE ' + whereCondition : ''}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ${limit} OFFSET ${offset}
  `;
  const res = await db.sequelize.query(sql, { type: Sequelize.QueryTypes.SELECT });
  return res || [];
};

const getCountAllHistoryDataSensor = async () => {
  try {
    const count = await executeCountQuery("");
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getAllHistoryDataSensor = async (typeSort, sort, meta) => {
  try {
    const data = await executeDataQuery("", typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDataSensorByTime = async (value) => {
  try {
    const isDateOnly = value.length === 10;
    const cond = isDateOnly ? `DATE(Time) = '${value}'` : `Time = '${value}'`;
    const count = await executeCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDataSensorByTime = async (value, typeSort, sort, meta) => {
  try {
    const isDateOnly = value.length === 10;
    const cond = isDateOnly ? `DATE(Time) = '${value}'` : `Time = '${value}'`;
    const data = await executeDataQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDataSensorByLight = async (value) => {
  try {
    const cond = `Light BETWEEN ${parseFloat(value) - 0.1} AND ${parseFloat(value) + 0.1}`;
    const count = await executeCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDataSensorByLight = async (value, typeSort, sort, meta) => {
  try {
    const cond = `Light BETWEEN ${parseFloat(value) - 0.1} AND ${parseFloat(value) + 0.1}`;
    const data = await executeDataQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDataSensorByHumidity = async (value) => {
  try {
    const cond = `Humidity BETWEEN ${parseFloat(value) - 0.1} AND ${parseFloat(value) + 0.1}`;
    const count = await executeCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDataSensorByHumidity = async (value, typeSort, sort, meta) => {
  try {
    const cond = `Humidity BETWEEN ${parseFloat(value) - 0.1} AND ${parseFloat(value) + 0.1}`;
    const data = await executeDataQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
};

const getCountHistoryDataSensorByTemperature = async (value) => {
  try {
    const cond = `Temperature BETWEEN ${parseFloat(value) - 0.1} AND ${parseFloat(value) + 0.1}`;
    const count = await executeCountQuery(cond);
    return { data: count, status: 200 };
  } catch(error){ return { status: 500 }; }
};

const getHistoryDataSensorByTemperature = async (value, typeSort, sort, meta) => {
  try {
    const cond = `Temperature BETWEEN ${parseFloat(value) - 0.1} AND ${parseFloat(value) + 0.1}`;
    const data = await executeDataQuery(cond, typeSort, sort, meta);
    return { data: data, status: data.length > 0 ? 200 : 404 };
  } catch(error){ return { status: 500 }; }
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
      // Gán giá trị theo tên cảm biến, làm tròn 2 chữ số thập phân cho Nhiệt độ
      let val = item.value;
      if (item.Sensor.name === 'Temperature') {
        val = Math.round(val * 100) / 100;
      }
      groupedData[timeStr][item.Sensor.name] = val;
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

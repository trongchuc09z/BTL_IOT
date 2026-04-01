const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Sensor extends Model {
    static associate(models) {
      Sensor.hasMany(models.DataSensor, { foreignKey: 'id_ss' });
    }
  }
  Sensor.init({
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING, allowNull: false },
    created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, {
    sequelize,
    modelName: "Sensor",
    tableName: "sensor",
    timestamps: false // Tắt tự động tạo createdAt, updatedAt của Sequelize
  });
  return Sensor;
};
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DataSensor extends Model {
    static associate(model) {}
  }
  DataSensor.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Temperature: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      Humidity: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      Light: {
        type: DataTypes.FLOAT,
        allowNull: false,
      },
      Time: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "DataSensor",
      tableName: "data_sensor",
      timestamps: false,
    }
  );
  DataSensor.removeAttribute("id");
  return DataSensor;
};

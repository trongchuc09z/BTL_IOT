const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class HistoryDevice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  HistoryDevice.init(
    {
      Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      Device: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      Time: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "HistoryDevice",
      tableName: "history_device",
      timestamps: false,
    }
  );
  HistoryDevice.removeAttribute("id");

  return HistoryDevice;
};

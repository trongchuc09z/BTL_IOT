const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class DataSensor extends Model {
        static associate(models) {
            DataSensor.belongsTo(models.Sensor, { foreignKey: 'id_ss' });
        }
    }
    DataSensor.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_ss: { type: DataTypes.INTEGER, allowNull: false },
        value: { type: DataTypes.FLOAT, allowNull: false },
        date_time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: "DataSensor",
        tableName: "datasensor",
        timestamps: false
    });
    return DataSensor;
};
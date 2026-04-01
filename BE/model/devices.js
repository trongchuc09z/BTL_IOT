const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Devices extends Model {
        static associate(models) {
            Devices.hasMany(models.ActionHistory, { foreignKey: 'device_id' });
        }
    }
    Devices.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING(255), allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
        status: { type: DataTypes.STRING(10), allowNull: true }
    }, {
        sequelize,
        modelName: "Devices",
        tableName: "devices",
        timestamps: false
    });
    return Devices;
};
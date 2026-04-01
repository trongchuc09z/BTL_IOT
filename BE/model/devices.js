const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class Devices extends Model {
        static associate(models) {
            Devices.hasMany(models.ActionHistory, { foreignKey: 'id_devices' });
        }
    }
    Devices.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        name: { type: DataTypes.STRING, allowNull: false },
        created_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: "Devices",
        tableName: "devices",
        timestamps: false
    });
    return Devices;
};
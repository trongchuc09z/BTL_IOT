const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
    class ActionHistory extends Model {
        static associate(models) {
            ActionHistory.belongsTo(models.Devices, { foreignKey: 'id_devices' });
        }
    }
    ActionHistory.init({
        id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
        id_devices: { type: DataTypes.INTEGER, allowNull: false },
        action: { type: DataTypes.STRING, allowNull: false },
        status: { type: DataTypes.STRING, allowNull: false },
        time: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
    }, {
        sequelize,
        modelName: "ActionHistory",
        tableName: "action_history",
        timestamps: false
    });
    return ActionHistory;
};
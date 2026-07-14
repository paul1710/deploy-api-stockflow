const { DataTypes } = require('sequelize')
const sequelize = require("../config/db")

const Venta = sequelize.define('Venta', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
    }
}, {
    tableName: 'venta',
    timestamps: true
})

module.exports = Venta
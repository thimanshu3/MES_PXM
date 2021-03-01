const { DataTypes } = require('sequelize')

const { MySql } = require('../db')

const Role = MySql.define('userRole', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
})

module.exports = Role

const { Sequelize, DataTypes } = require('sequelize')

const { MySql } = require('../db')

const LoginReport = MySql.define('loginReport', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    updatedAt: false
})

module.exports = LoginReport

// LoginReport.sync({ force: process.env.NODE_ENV === 'production' ? false : true })
const { Sequelize, DataTypes } = require('sequelize')

const { MySql } = require('../db')

const ForgotPassword = MySql.define('forgotPassword', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    user: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    updatedAt: false
})

module.exports = ForgotPassword

// ForgotPassword.sync({ force: process.env.NODE_ENV === 'production' ? false : true })
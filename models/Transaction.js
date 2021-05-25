const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const transaction = MySql.define('transaction', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productCount: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
})

module.exports = transaction

// transaction
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         console.log('sync completed')
//     })
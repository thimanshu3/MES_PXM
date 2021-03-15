const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')


//Model not complete ...need to work on it!!!!


const productData = MySql.define('productData', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        autoIncrement: true,
        primaryKey: true,
    },
    productId: { //id of product from productMetaData table
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.STRING
    }

})

module.exports = productData

// productData
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//        console.log('sync completed')
//     })
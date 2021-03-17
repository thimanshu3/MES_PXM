const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const productData = MySql.define('productData', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    productId: { //id of product from productMetaData table
        type: DataTypes.STRING,
        allowNull: false
    },
    fieldId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    fieldValue:{
        type:DataTypes.STRING(1000),
        allowNull:false
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
const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const productMetaData = MySql.define('productMetaData', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        defaultValue:"Sample Product"
    },
    formId: {
        type: DataTypes.STRING
    },
    transactionId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    productType:{
        type: DataTypes.STRING,
        allowNull:false
    },
    CatalogueHierarchy:{
        type:DataTypes.STRING,
        defaultValue:"master"
    },
    Catalogue:{
        type:DataTypes.STRING
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    updatedBy: {
        type: DataTypes.STRING
    },
    stage: {
        type: DataTypes.TINYINT,
        defaultValue: 1
    }
})

module.exports = productMetaData

// productMetaData
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//        console.log('sync completed')
//     })
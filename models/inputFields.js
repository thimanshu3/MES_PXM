// The model contains item/record (product) fields like name, price, sku, description, etc.
const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const inputFields = MySql.define('inputFields', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    label: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.STRING,
        defaultValue:"System Init"
    },
    updatedBy: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING(5000),
    },
    typeOfField: {// Eg. text, int, telephone, email, checkbox, radio, etc.
        type: DataTypes.STRING,
        allowNull: false,
    },
    associatedList:{
        type: DataTypes.STRING,
        defaultValue: '-'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    required: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isItemField: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }

})

module.exports = inputFields

// inputFields
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => console.log('\x1b[32m%s\x1b[0m', 'inputFields Model Sync Complete!'))
//     .catch(err => {
//          if (err.name === 'SequelizeUniqueConstraintError') {
//          console.log('Already Exists!')
//          console.log('\x1b[32m%s\x1b[0m', 'User Model Sync Complete!')
//          }
//          else {
//          console.error(err)
//          process.exit(1)
//          }
//     })
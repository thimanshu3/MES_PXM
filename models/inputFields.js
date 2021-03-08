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
    }

})

module.exports = inputFields

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
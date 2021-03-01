const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const inputTypes = MySql.define('inputTypes', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    inputType: { //Example whether it is a text input or list, etc
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    createdBy: {
        type: DataTypes.STRING,
    },
    updatedBy: {
        type: DataTypes.STRING
    }
})

module.exports = inputTypes

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
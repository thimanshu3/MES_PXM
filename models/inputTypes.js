const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const inputTypes = MySql.define('inputTypes', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    inputType: { //Example whether it is a text input or list, etc
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    status: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
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
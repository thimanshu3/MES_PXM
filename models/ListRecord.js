const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const listRecord = MySql.define('listRecord', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
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

module.exports = listRecord

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
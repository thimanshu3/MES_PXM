const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const manufacturer = MySql.define('manufacturer', {
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
        defaultValue:"System Init"
    },
    updatedBy: {
        type: DataTypes.STRING
    }
})

module.exports = manufacturer

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
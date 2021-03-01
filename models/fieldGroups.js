const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const fieldGroups = MySql.define('fieldGroups', {
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
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }

})

module.exports = fieldGroups

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
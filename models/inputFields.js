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
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING(5000),
    },
    typeOfField: {
        type: DataTypes.STRING,
        allowNull: false,
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
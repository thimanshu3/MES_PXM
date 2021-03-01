const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const AttributeValueSet = MySql.define('AttributeValueSet', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentAttributeId: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    createdBy: {
        type: DataTypes.STRING,
    },
    updatedBy: {
        type: DataTypes.STRING
    }
})

module.exports = AttributeValueSet

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
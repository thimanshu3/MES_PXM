const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const fieldsAssignedToGroup = MySql.define('fieldsAssignedToGroup', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    groupId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fieldId: {
        tpye: DataTypes.STRING,
        allowNull: false
    },
    AssignedBy: {
        type: DataTypes.STRING,
        allowNull: false
    }
})

module.exports = fieldsAssignedToGroup

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
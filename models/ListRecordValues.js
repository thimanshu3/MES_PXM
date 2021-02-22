const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const listRecordValues = MySql.define('listRecordValues', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentListId:{
        type:DataTypes.STRING,
        allowNull:false
    },
    createdBy: {
    type: DataTypes.STRING,
    allowNull: false
    },
    updatedBy: {
    type: DataTypes.STRING
    }
})

module.exports = listRecordValues

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
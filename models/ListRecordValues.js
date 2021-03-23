const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const listRecordValues = MySql.define('listRecordValues', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    label: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentListId: {
        type: DataTypes.STRING,
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

module.exports = listRecordValues

// listRecordValues
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//       console.log('done')
//     })
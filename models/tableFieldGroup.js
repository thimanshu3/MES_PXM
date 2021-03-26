const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const tableFieldGroup = MySql.define('tableFieldGroup', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    tableID: {
        type: DataTypes.STRING,
        allowNull: false
    },
    fieldId: {
        type:DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.STRING,
    },
    updatedBy: {
        type: DataTypes.STRING,
    }

})

module.exports = tableFieldGroup

const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const form = MySql.define('form', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    stage:{
        type: DataTypes.TINYINT,
        defaultValue: 1
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
        defaultValue: true
    }

})

module.exports = form

// form
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         console.log('ho gaya');
//     })
const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const Catalogue = MySql.define('Catalogue', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    text: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    parentId: {
        type: DataTypes.STRING,
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

module.exports = Catalogue

// Catlogue
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//        console.log('sync completed')
//     })
const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const CatalogueHierarchy = MySql.define('CatalogueHierarchy', {
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

module.exports = CatalogueHierarchy


// CatalogueHierarchy
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//       
//     })
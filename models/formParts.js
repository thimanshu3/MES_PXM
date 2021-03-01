// This model is for basic components a form can have like a section, sub-section, tab, etc.
// These parts can be added as individual entities in a form.
const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const formParts = MySql.define('formParts', {
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
    description: {
        type: DataTypes.STRING(500),
        allowNull: true
    },
    // componentType: {
    //     type: DataTypes.STRING(500),
    //     allowNull: false
    // },
    isSubComponent:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    createdBy: {
        type: DataTypes.STRING,
        defaultValue: "System Init"
    },
    updatedBy: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }

})

module.exports = formParts

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
// This file contains keeps the configuration/ details like section name , tab, name ,etc.
const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const formConfig = MySql.define('formConfig', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    parentFormId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    parentPartId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    partType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    partTypeId:{
        type: DataTypes.STRING,
        allowNull: false
    },
    partTitle: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue:"Unnamed"
    },
    formOrder:{
        type: DataTypes.SMALLINT,
        allowNull:false
    },
    isSubpart:{
        type: DataTypes.BOOLEAN,
        defaultValue:false
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

module.exports = formConfig

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
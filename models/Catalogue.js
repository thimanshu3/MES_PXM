const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const Catlogue = MySql.define('Catlogue', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    CatalogueHierarchy: {
        type: DataTypes.STRING,
        default: 'Unassigned'
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false
    },
    updatedBy: {
        type: DataTypes.STRING
    }

})

module.exports = Catlogue

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//        ])
//     })
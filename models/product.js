const { DataTypes } = require('sequelize')

const { MySql } = require('../db')

const productType = MySql.define('producttype', {
    id: {
        type: DataTypes.INTEGER,
        unique: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    }
})

module.exports = product

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'single line item'
//         },
// {
//     id:1, 
//     name: 'netsuite data feed'
// },
// {
//     id:2,

// }
//        ])
//     })
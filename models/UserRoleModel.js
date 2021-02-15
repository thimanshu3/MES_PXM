const { DataTypes } = require('sequelize')

const { MySql } = require('../db')

const Role = MySql.define('userRole', {
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

module.exports = Role

// Role
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         Role.bulkCreate([{
//             id: 0,
//             name: 'admin'
//         },
//         {
//             id: 1,
//             name: 'spoc'
//         },
//         {
//             id: 2,
//             name: 'faculty'
//         },
//         {
//             id: 3,
//             name: 'student'
//         }])
//     })
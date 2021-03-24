const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const productTable = MySql.define('productTable', {
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
    fields: {
        type: DataTypes.STRING,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    createdBy: {
        type: DataTypes.STRING,
    },
    updatedBy: {
        type: DataTypes.STRING,
    }

})

module.exports = productTable

// productTable
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() => {
//         productTable.bulkCreate([{
//             id: 0,
//             name: 'Vendors',
//             fields: '[{"name":"Vendor","fieldId","c777fbe1-065d-4062-8ba5-e4852f07c60a"},{"name":"Code","fieldId","no"},{"name":"Schedule","fieldId","no"},{"name":"Preferred","fieldId","f714e15d-447f-4f4a-bac9-e416e014fe3a"},{"name":"Purchase Prices","fieldId","00e86f78-cdcb-4bc5-82ab-80b39ab96aa6"}]',
//             createdBy: 'admin'
//         },
//         {id: 1, name: ''}
//         ])
//     })
//     .catch(err => {
//         if (err.name === 'SequelizeUniqueConstraintError') {
//             console.log('Already Exists!')
//             console.log('\x1b[32m%s\x1b[0m', 'productTable Model Sync Complete!')
//         }
//         else {
//             console.error(err)
//             process.exit(1)
//         }
//     })
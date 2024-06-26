const { DataTypes, Sequelize } = require('sequelize')

const { MySql } = require('../db')

const productSpecificTableData = MySql.define('productSpecificTableData', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    data: {
        type: DataTypes.STRING,
        allowNull: false
    },
    productId: {
        type: DataTypes.STRING,
        allowNull: false
    },
    tableId:{
        type: DataTypes.STRING,
        allowNull: false
    },
    createdBy: {
        type: DataTypes.STRING,
    },
    updatedBy: {
        type: DataTypes.STRING,
    }

})

module.exports = productSpecificTableData


// productSpecificTableData
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
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
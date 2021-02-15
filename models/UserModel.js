const { Sequelize, DataTypes } = require('sequelize')

const { MySql } = require('../db')

const User = MySql.define('user', {
    id: {
        type: DataTypes.UUID,
        unique: true,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    role: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    contactNumber: {
        type: DataTypes.BIGINT,
        unique: true,
        allowNull: false
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    gender: {
        type: DataTypes.STRING(6),
        allowNull: false
    },
    profileImageSource: {
        type: DataTypes.STRING(1023),
        defaultValue: 'default-user.png'
    },
    alternateEmail: {
        type: DataTypes.STRING,
        allowNull: true
    },
    githubUrl: {
        type: DataTypes.STRING(1023),
        allowNull: true
    },
    linkedinUrl: {
        type: DataTypes.STRING(1023),
        allowNull: true
    },
    specialization: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    enrollmentYear: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    semester: {
        type: DataTypes.INTEGER,
        allowNull: true,
        values: [1, 2, 3, 4, 5, 6, 7, 8]
    },
    college: {
        type: DataTypes.STRING,
        allowNull: true
    }
})

module.exports = User

// User
//     .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
//     .then(() =>
//         User.create({
//             id: 'admin',
//             email: 'admin@admin.com',
//             password: '$2a$10$Ad8sqo3nSqDUoKC/n39.puBfd2ADMKJHbOaq73iFJySeCjb9Lieda',
//             role: 0,
//             contactNumber: 8696932715,
//             firstName: 'Aaditya',
//             lastName: 'Maheshwari',
//             gender: 'male'
//         }))
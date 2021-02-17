require('dotenv').config()

require('./db')
const {
    ForgotPassword,
    LoginReport,
    User,
    UserRole,
    Vendor,
    ProductType,
    AttrubuteSet,
    ActivityLog,
    AttributeValueSets,
    CatalogueHierarchy,
    Distributor,
    Manufacturer,
} = require('./models')

const ENVIRONMENT_VARIABLES = [
    'NODE_ENV',
    'PORT',
    'SESSION_SECRET',
    'NODEMAILER_EMAIL',
    'NODEMAILER_PASSWORD',
    'GOOGLE_0AUTH_CLIENT_ID',
    'GOOGLE_0AUTH_CLIENT_SECRET',
    'PUPPETEER_URL'
]

const checkEnvironment = () => {
    const errors = []
    ENVIRONMENT_VARIABLES.forEach(envVar => {
        if (!process.env[envVar])
            errors.push(`${envVar} Not Set in .env File OR in Environment Variables!`)
    })
    if (errors.length) {
        errors.forEach(err => console.error(err))
        process.exit(1)
    }
}

checkEnvironment()


Manufacturer
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Manufacturer Model Sync Complete'))

ProductType
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'ProductType Model Sync Complete'))

Vendor
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'vendor Model Sync Complete'))

AttributeValueSets
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'AttributesValueSets Model Sync Complete'))

AttrubuteSet
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'AttributesSet Model Sync Complete'))

CatalogueHierarchy
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'CatalogueHierarchy Model Sync Complete'))


Distributor
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Distributor Model Sync Complete'))

ForgotPassword
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'ForgotPassword Model Sync Complete'))


LoginReport
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'LoginReport Model Sync Complete'))


User
    .sync()
    .then(() =>
        User.create({
            id: 'admin',
            email: 'admin@medicaleshop.com',
            password: '$2a$10$Ad8sqo3nSqDUoKC/n39.puBfd2ADMKJHbOaq73iFJySeCjb9Lieda',
            role: 0,
            contactNumber: 63788,
            firstName: 'Hanzala',
            lastName: 'Inayat',
            gender: 'male'
        }))
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'User Model Sync Complete!'))
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Already Exists!')
            console.log('\x1b[32m%s\x1b[0m', 'User Model Sync Complete!')
        }
        else {
            console.error(err)
            process.exit(1)
        }
    })

UserRole
    .sync()
    .then(() =>
        UserRole.bulkCreate([{
            id: 0,
            name: 'admin'
        },
        {
            id: 1,
            name: 'Product Manager'
        },
        {
            id: 2,
            name: 'Power User'
        },
        ]))
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'UserRole Model Sync Complete!'))
    .catch(err => {
        if (err.name === 'SequelizeUniqueConstraintError') {
            console.log('Already Exists!')
            console.log('\x1b[32m%s\x1b[0m', 'UserRole Model Sync Complete!')
        }
        else {
            console.error(err)
            process.exit(1)
        }
    })
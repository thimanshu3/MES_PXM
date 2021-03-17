require('dotenv').config()
require('./db')
const {
    ForgotPassword,
    LoginReport,
    User,
    UserRole,
    Vendor,
    ProductType,
    AttributeSet,
    AttributeValueSets,
    CatalogueHierarchy,
    Distributor,
    Manufacturer,
    Catalogue,
    fieldGroups,
    fieldsAssignedToGroup,
    inputFields,
    inputTypes,
    listRecord,
    listRecordValues,
    form,
    formParts,
    formConfig,
    productData,
    productMetaData
} = require('./models')

const ENVIRONMENT_VARIABLES = [
    'NODE_ENV',
    'PORT',
    'SESSION_SECRET',
    'NODEMAILER_EMAIL',
    'NODEMAILER_PASSWORD',
    'GOOGLE_0AUTH_CLIENT_ID',
    'GOOGLE_0AUTH_CLIENT_SECRET',
    //'PUPPETEER_URL'
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

// Product Sellers
Manufacturer
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Manufacturer Model Sync Complete'))

Vendor
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'vendor Model Sync Complete'))

Distributor
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Distributor Model Sync Complete'))

// Product related Models
ProductType
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'ProductType Model Sync Complete'))

AttributeValueSets
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'AttributesValueSets Model Sync Complete'))

AttributeSet
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'AttributesSet Model Sync Complete'))

fieldGroups
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'fieldGroups Model Sync Complete'))

fieldsAssignedToGroup
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'fieldsAssignedToGroup Model Sync Complete'))

listRecord
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'listRecord Model Sync Complete'))

listRecordValues
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'listRecordValues Model Sync Complete'))

inputFields
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'inputfields Model Sync Complete'))

inputTypes
    .sync()
    .then(() =>
        inputTypes.bulkCreate([{
            inputType: 'check box'
        },
        {
            inputType: 'Currency'
        },
        {
            inputType: 'date'
        },
        {
            inputType: 'datetime'
        },
        {
            inputType: 'datetime-local'
        },
        {
            inputType: 'color'
        },
        {
            inputType: 'email'
        },
        {
            inputType: 'file'
        },
        {
            inputType: 'hidden'
        },
        {
            inputType: 'image'
        },
        {
            inputType: 'number'
        },
        {
            inputType: 'month'
        },
        {
            inputType: 'password'
        },
        {
            inputType: 'radio'
        },
        {
            inputType: 'range'
        },
        {
            inputType: 'reset'
        },
        {
            inputType: 'submit'
        },
        {
            inputType: 'search'
        },
        {
            inputType: 'tel'
        },
        {
            inputType: 'text'
        },
        {
            inputType: 'time'
        },
        {
            inputType: 'url'
        },
        {
            inputType: 'week'
        },
        {
            inputType: 'list/record'
        },
        {
            inputType: 'inline html'
        },
        {
            inputType: 'multiple select'
        }
        ]))
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'inputTypes Model Sync Complete!'))
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


CatalogueHierarchy
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'CatalogueHierarchy Model Sync Complete'))

Catalogue
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Catalogue Model Sync Complete'))

// Custom Form Models

form
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Form Model Sync Complete'))

formParts
    .sync()
    .then(() => formParts.bulkCreate([
        {
            "name":"Section",
            "componentType":1
        },
        {
            "name":"Tab",
            "componentType": 2
        },
        {
            "name":"Sub-Section",
            "isSubComponent":true,
            "componentType": 3
        },
        {
            "name":"Sub-Tab",
            "isSubComponent":true,
            "componentType": 4
        }
    ]))
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'FormParts Model Sync Complete'))

formConfig
    .sync()
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'Form Config Model Sync Complete'))

//User Related Models
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

productData
    .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'productData Model Sync Complete!'))
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

productMetaData
    .sync({ force: process.env.NODE_ENV === 'production' ? false : true })
    .then(() => console.log('\x1b[32m%s\x1b[0m', 'productMetaData Model Sync Complete!'))
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
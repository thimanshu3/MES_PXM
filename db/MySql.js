const { Sequelize } = require('sequelize')

const sequelize = new Sequelize(process.env.MYSQLDB_URI, {
    timezone: '+05:30',
    logQueryParameters: true,
    logging: str => {
        console.log('\x1b[35m%s\x1b[0m', str)
    }
})

sequelize.authenticate().then(() => {
    console.log('\x1b[34m%s\x1b[0m', 'Connected to MySqlDB...')
}).catch(err => {
    console.error('\x1b[31m%s\x1b[0m', err)
    process.exit(1)
})

module.exports = sequelize
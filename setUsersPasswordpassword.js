require('dotenv').config()

require('./db')
const { User } = require('./models')

const main = async () => {
    await User.update({
        password: '$2a$10$Ad8sqo3nSqDUoKC/n39.puBfd2ADMKJHbOaq73iFJySeCjb9Lieda'
    }, {
        where: {}
    })
}

main()
    .then(() => {
        console.log('Finished...')
        process.exit(0)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })
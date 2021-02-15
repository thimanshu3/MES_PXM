require('dotenv').config()

require('./db')
const { User } = require('./models')

const main = async () => {
    await User.create({
        id: 'admin-ekansh',
        email: 'ejekanshjain@gmail.com',
        password: '$2a$10$Ad8sqo3nSqDUoKC/n39.puBfd2ADMKJHbOaq73iFJySeCjb9Lieda',
        role: 0,
        contactNumber: 8619552249,
        firstName: 'Ekansh',
        lastName: 'Jain',
        gender: 'male'
    })
}

main()
    .then(() => {
        console.log(`Finished...`)
        process.exit(0)
    })
    .catch(err => {
        console.log(err)
        process.exit(1)
    })
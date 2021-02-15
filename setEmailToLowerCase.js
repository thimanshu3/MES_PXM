const async = require('async')
require('dotenv').config()

require('./db')
const { User } = require('./models')

const main = async () => {
    const users = await User.findAll({
        where: {
            role: 3
        }
    })
    await async.forEachLimit(users, 10, async user => {
        user.email = user.email.toLowerCase()
        await user.save()
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
if (process.env.NODE_ENV === 'production') {
    const cron = require('node-cron')
    const { Op } = require('sequelize')

    const { User } = require('../models')

    cron.schedule('0 0 1 1,7 *', async () => {
        await User.update({
            active: false
        }, {
            where: {
                role: 3,
                semester: 8
            }
        })
        await User.increment('semester', {
            by: 1,
            where: {
                role: 3,
                semester: {
                    [Op.lt]: 8
                }
            }
        })
    })

    console.log('Increment Semester Cron Job Initilised')
}
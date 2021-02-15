if (process.env.NODE_ENV === 'production') {
    const cron = require('node-cron')

    const academicCourseLogJob = require('./academicCourseLogJob')
    const loginReportJob = require('./loginReportJob')
    const activityLogJob = require('./activityLogJob')

    const buildDataEvery15Minute = async () => {
        const start = new Date()
        start.setUTCMilliseconds(0)
        start.setUTCSeconds(0)

        const end = new Date(start)
        start.setUTCMinutes(start.getUTCMinutes() - 15)

        await academicCourseLogJob({ start, end })
        await loginReportJob({ start, end })
        await activityLogJob({ start, end })
    }

    cron.schedule('*/15 * * * *', buildDataEvery15Minute)

    console.log('\x1b[34m%s\x1b[0m', 'Analytics Cron Jobs Initialised...')
}
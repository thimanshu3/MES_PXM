require('dotenv').config()
const async = require('async')

const { ElasticSearch } = require('./db')

const { LoginReport, User, College, Specialization } = require('./models')
const { esUtil: { createIndex } } = require('./util')

const transformLoginReport = async obj => {
    obj.logId = obj.id
    delete obj.id

    obj.userId = obj.user
    obj.user = {}

    obj.date = new Date(obj.createdAt)
    obj.date.setUTCMilliseconds(0)
    obj.date.setUTCSeconds(0)
    obj.date.setUTCMinutes(0)
    obj.date.setUTCHours(0)

    const user = (await User.findOne({
        where: {
            id: obj.userId
        },
        attributes: [
            'firstName',
            'lastName',
            'email',
            'contactNumber',
            'semester',
            'gender',
            'specialization',
            'role'
        ]
    }))?.toJSON()

    obj.user.name = user?.firstName + ' ' + user?.lastName
    obj.user.email = user?.email
    obj.user.contactNumber = user?.contactNumber
    obj.user.semester = user?.semester
    obj.user.gender = user?.gender
    obj.user.specializationId = user?.specialization
    obj.user.role = user?.role

    if (obj.user.specializationId)
        obj.user.specializationName = (await Specialization.findOne({
            where: {
                id: obj.user.specializationId
            },
            attributes: ['name']
        }))?.toJSON()?.name

    if (obj.user.collegeId)
        obj.user.collegeName = (await College.findOne({
            where: {
                id: obj.user.collegeId
            },
            attributes: ['name']
        }))?.toJSON()?.name

    return obj
}

const buildData = async () => {
    const indexTime = new Date()
    const data = []
    const indexName = 'login-report'
    const logs = (await LoginReport.findAll()).map(e => e.toJSON())
    await async.forEachLimit(logs, 100, async obj => {
        data.push(await transformLoginReport(obj))
    })
    if (data.length) {
        const bulkData = []
        data.forEach(obj => {
            obj.indexTime = indexTime
            bulkData.push({ update: { _index: indexName, _id: obj.logId } })
            bulkData.push({ doc: obj, doc_as_upsert: true })
        })
        await createIndex(ElasticSearch, indexName)
        await ElasticSearch.bulk({
            body: bulkData
        })
    }
}

const main = async () => {
    await buildData()
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
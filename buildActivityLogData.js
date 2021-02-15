require('dotenv').config()
const async = require('async')

const { ElasticSearch } = require('./db')

const { ActivityLog, User, Specialization, College, AcademicCourse, Chapter, Lesson, Course, Topic, Quiz, QuizAssignment, QuizAssignmentResponse, Dropzone } = require('./models')
const { esUtil: { createIndex } } = require('./util')

const transformActivityLog = async obj => {
    const newObj = {
        activityId: obj.id,
        activityName: obj.name,
        activityType: obj.type,
        timestamp: obj.timestamp
    }
    newObj.logId = obj._id

    newObj.userId = obj.user
    newObj.user = {}

    newObj.date = new Date(newObj.timestamp)
    newObj.date.setUTCMilliseconds(0)
    newObj.date.setUTCSeconds(0)
    newObj.date.setUTCMinutes(0)
    newObj.date.setUTCHours(0)

    const user = (await User.findOne({
        where: {
            id: newObj.userId
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

    newObj.user.name = user?.firstName + ' ' + user?.lastName
    newObj.user.email = user?.email
    newObj.user.contactNumber = user?.contactNumber
    newObj.user.semester = user?.semester
    newObj.user.gender = user?.gender
    newObj.user.specializationId = user?.specialization
    newObj.user.role = user?.role

    if (newObj.user.specializationId)
        newObj.user.specializationName = (await Specialization.findOne({
            where: {
                id: newObj.user.specializationId
            },
            attributes: ['name']
        }))?.toJSON()?.name

    if (newObj.user.collegeId)
        newObj.user.collegeName = (await College.findOne({
            where: {
                id: newObj.user.collegeId
            },
            attributes: ['name']
        }))?.toJSON()?.name

    switch (newObj.activityName) {
        case 'Academic Course': {
            newObj.activityModel = 'AcademicCourse'
            const ac = await AcademicCourse.findOne({ where: { id: newObj.activityId }, attributes: ['name'] })
            if (ac) {
                newObj.activityTitle = ac.name
            }
            break
        }
        case 'Academic Course Chapter': {
            newObj.activityModel = 'Chapter'
            const c = await Chapter.findOne({ where: { id: newObj.activityId }, attributes: ['name', 'number'] })
            if (c) {
                newObj.activityTitle = c.name
                newObj.activityNumber = c.number
            }
            break
        }
        case 'Academic Course Lesson': {
            newObj.activityModel = 'Lesson'
            if (newObj.activityType === 'Delete') break
            const l = await Lesson.findOne({ where: { id: newObj.activityId }, attributes: ['name', 'number'] })
            if (l) {
                newObj.activityTitle = l.name
                newObj.activityNumber = l.number
            }
            break
        }
        case 'Course': {
            newObj.activityModel = 'Course'
            const c = await Course.findOne({ where: { id: newObj.activityId }, attributes: ['name'] })
            if (c) {
                newObj.activityTitle = c.name
            }
            break
        }
        case 'Course Topic': {
            newObj.activityModel = 'Topic'
            const t = await Topic.findOne({ where: { id: newObj.activityId }, attributes: ['name'] })
            if (t) {
                newObj.activityTitle = t.name
            }
            break
        }
        case 'Faculty': {
            newObj.activityModel = 'User'
            const u = await User.findOne({ where: { id: newObj.activityId }, attributes: ['firstName', 'lastName'] })
            if (u) {
                newObj.activityTitle = u.firstName + ' ' + u.lastName
            }
            break
        }
        case 'FAQ': {
            newObj.activityTitle = 'FAQ'
            break
        }
        case 'Quiz': {
            if (
                newObj.activityType === 'Create' ||
                newObj.activityType === 'View' ||
                newObj.activityType === 'Preview' ||
                newObj.activityType === 'Create Question' ||
                newObj.activityType === 'Import' ||
                newObj.activityType === 'Publish'
            ) {
                newObj.activityModel = 'Quiz'
                const q = await Quiz.findOne({ _id: newObj.activityId }, { name: 1 })
                if (q) {
                    newObj.activityTitle = q.name
                }
            } else if (
                newObj.activityType === 'Attempt' ||
                newObj.activityType === 'Tab Change' ||
                newObj.activityType === 'End' ||
                newObj.activityType === 'Force End'
            ) {
                newObj.activityModel = 'QuizAssignmentResponse'
                const qr = await QuizAssignmentResponse.findOne({ _id: newObj.activityId }, { quizId: 1 })
                if (qr) {
                    const q = await Quiz.findOne({ _id: qr.quizId }, { name: 1 })
                    if (q) {
                        newObj.activityTitle = q.name
                    }
                }
            }
            break
        }
        case 'Quiz Assignment': {
            newObj.activityModel = 'QuizAssignment'
            const qa = await QuizAssignment.findOne({ where: { id: newObj.activityId }, attributes: ['quizId'] })
            if (qa) {
                const q = await Quiz.findOne({ _id: qa.quizId }, { name: 1 })
                if (q) {
                    newObj.activityTitle = q.name
                }
            }
            break
        }
        case 'Quiz Question': {
            newObj.activityModel = 'Quiz'
            const q = await Quiz.findOne({ 'questions._id': newObj.activityId }, { questions: 1 })
            if (q) {
                const fq = q.questions.find(ques => ques._id === newObj.activityId)
                if (fq) {
                    newObj.activityTitle = fq.text
                }
            }
            break
        }
        case 'Quiz Assignment Response': {
            newObj.activityModel = 'QuizAssignmentResponse'
            const qr = await QuizAssignmentResponse.findOne({ _id: newObj.activityId }, { quizId: 1 })
            if (qr) {
                const q = await Quiz.findOne({ _id: qr.quizId }, { name: 1 })
                if (q) {
                    newObj.activityTitle = q.name
                }
            }
            break
        }
        case 'Quiz Questions Review': {
            newObj.activityModel = 'QuizAssignmentResponse'
            const qr = await QuizAssignmentResponse.findOne({ _id: newObj.activityId }, { quizId: 1 })
            if (qr) {
                const q = await Quiz.findOne({ _id: qr.quizId }, { name: 1 })
                if (q) {
                    newObj.activityTitle = q.name
                }
            }
            break
        }
        case 'Dropzone': {
            newObj.activityModel = 'Dropzone'
            const d = await Dropzone.findOne({ _id: newObj.activityId }, { name: 1 })
            if (d) {
                newObj.activityTitle = d.name
            }
            break
        }
    }

    return newObj
}

const buildData = async () => {
    const indexTime = new Date()
    const data = []
    const indexName = 'activity-logs'
    const logs = await ActivityLog.find()
    await async.forEachLimit(logs, 100, async obj => {
        data.push(await transformActivityLog(obj))
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
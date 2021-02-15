require('dotenv').config()
const async = require('async')

const { ElasticSearch } = require('./db')
const {
    StudentAcademicCourseLog,
    User,
    Specialization,
    College,
    AcademicCourse,
    Chapter,
    Lesson
} = require('./models')
const { esUtil: { createIndex } } = require('./util')

const transformStudentAcademicCourseLog = async obj => {
    obj.logId = obj.id
    delete obj.id

    obj.userId = obj.user
    obj.user = {}

    obj.user.collegeId = obj.college
    delete obj.college

    obj.academicCourseId = obj.academicCourse
    obj.academicCourse = {}

    obj.chapterId = obj.chapter
    delete obj.chapter

    obj.lessonId = obj.lesson
    delete obj.lesson

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
            'specialization'
        ]
    }))?.toJSON()

    obj.user.name = user?.firstName + ' ' + user?.lastName
    obj.user.email = user?.email
    obj.user.contactNumber = user?.contactNumber
    obj.user.semester = user?.semester
    obj.user.gender = user?.gender
    obj.user.specializationId = user?.specialization

    obj.user.specializationName = (await Specialization.findOne({
        where: {
            id: obj.user.specializationId
        },
        attributes: ['name']
    }))?.toJSON()?.name

    obj.user.collegeName = (await College.findOne({
        where: {
            id: obj.user.collegeId
        },
        attributes: ['name']
    }))?.toJSON()?.name

    const academicCourse = (await AcademicCourse.findOne({
        where: {
            id: obj.academicCourseId
        },
        attributes: [
            'name',
            'creator',
            'semester',
            'specializationId',
            'collegeId'
        ]
    }))?.toJSON()

    obj.academicCourse.name = academicCourse?.name
    obj.academicCourse.creatorId = academicCourse?.creator
    obj.academicCourse.semester = academicCourse?.semester
    obj.academicCourse.specializationId = academicCourse?.specializationId
    obj.academicCourse.collegeId = academicCourse?.collegeId

    obj.academicCourse.specializationName = (await Specialization.findOne({
        where: {
            id: obj.academicCourse.specializationId
        },
        attributes: ['name']
    }))?.toJSON()?.name

    obj.academicCourse.collegeName = (await College.findOne({
        where: {
            id: obj.academicCourse.collegeId
        },
        attributes: ['name']
    }))?.toJSON()?.name

    const creator = (await User.findOne({
        where: {
            id: obj.academicCourse.creatorId
        },
        attributes: ['firstName', 'lastName']
    }))?.toJSON()

    obj.academicCourse.creatorName = creator?.firstName + creator?.lastName

    const chapter = (await Chapter.findOne({
        where: {
            id: obj.chapterId
        },
        attributes: [
            'name',
            'number'
        ]
    }))?.toJSON()

    obj.chapterName = chapter?.name
    obj.chapterNumber = chapter?.number

    const lesson = (await Lesson.findOne({
        where: {
            id: obj.lessonId
        },
        attributes: [
            'name',
            'number',
            'duration'
        ]
    }))?.toJSON()

    obj.lessonName = lesson?.name
    obj.lessonNumber = lesson?.number
    obj.lessonDuration = lesson?.duration

    return obj
}

const buildData = async () => {
    const indexTime = new Date()
    const data = []
    const indexName = 'student-academic-course-log'
    const logs = (await StudentAcademicCourseLog.findAll()).map(e => e.toJSON())
    await async.forEachLimit(logs, 100, async obj => {
        data.push(await transformStudentAcademicCourseLog(obj))
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
const express = require('express')
const async = require('async')
const { Op } = require('sequelize')
const fetch = require('node-fetch')
const { promisify } = require('util')

const {
    CourseAssignedToStudent,
    Course,
    Unit,
    Topic,
    StudentCourseUnitTracking,
    StudentCourseTopicTracking,
    StudentCourseLog,
    ActivityLog
} = require('../../models')
const { MySql, Redis } = require('../../db')
const { formatDateMoment } = require('../../util')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const [result] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM courses c INNER JOIN (SELECT * FROM courseAssignedToStudents ca WHERE userId = ? AND expiresAt > now()) ca ON c.id = ca.courseId', { replacements: [req.user.id] })
        await Promise.all(result.map(async row => {
            const [units] = await MySql.query('SELECT u.unitNumber, su.completedAt as completedAt FROM units u LEFT JOIN studentCourseUnitTrackings su ON u.id = su.unitId AND su.courseAssignedToStudentId = ? WHERE u.courseId = ? ORDER BY u.unitNumber', { replacements: [row.id, row.courseId] })
            row.units = units
        }))
        const [result2] = await MySql.query('SELECT ca.id as id, c.name as name, c.imageSource as imageSource, ca.expiresAt as expiresAt, c.id as courseId FROM academicCourses c INNER JOIN (SELECT * FROM academicCourseAssignedToStudents ca WHERE userId = ? AND expiresAt > now()) ca ON c.id = ca.academicCourseId', { replacements: [req.user.id] })
        await Promise.all(result2.map(async row => {
            const [units] = await MySql.query('SELECT u.number, su.completedAt as completedAt FROM chapters u LEFT JOIN studentAcademicCourseChapterTrackings su ON u.id = su.chapterId AND su.academicCourseAssignedToStudentId = ? WHERE u.academicCourseId = ? ORDER BY u.number', { replacements: [row.id, row.courseId] })
            row.units = units
        }))
        res.render('student/courses', { User: req.user, courses: result, academicCourses: result2, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', (req, res) => res.redirect(`/student/courses/${req.params.id}/preview`))

router.get('/:id/preview', async (req, res) => {
    try {
        const course = await CourseAssignedToStudent.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        if (new Date(course.expiresAt) < new Date()) {
            req.flash('error', 'Course Already Expired!')
            res.redirect('/student/courses')
            return
        }

        const [units] = await MySql.query('SELECT u.id as id, u.unitNumber as unitNumber, s.completedAt as completedAt FROM (SELECT * FROM units WHERE courseId = ?) u LEFT JOIN (SELECT * FROM studentCourseUnitTrackings WHERE courseAssignedToStudentId = ?) s ON u.id = s.unitId ORDER BY u.unitNumber', { replacements: [course.courseId, course.id] })

        const [topics] = await MySql.query(`SELECT t.id as id, t.serialNumber as serialNumber, t.unitId as unitId, t.name as name, t.objectResourceId as objectResourceId, t.outcome as outcome, t.duration as duration, st.courseAssignedToStudentId as courseAssignedToStudentId, st.completedAt as completedAt FROM topics t LEFT JOIN (SELECT * FROM studentCourseTopicTrackings WHERE courseAssignedToStudentId = ?) st ON t.id = st.topicId WHERE t.unitId IN (${units.map(u => `'${u.id}'`)}) ORDER BY t.serialNumber`, { replacements: [course.id] })

        const CourseDetails = {}

        units.forEach(unit => CourseDetails[unit.id] = {
            ...unit,
            topics: []
        })

        topics.forEach(topic => CourseDetails[topic.unitId].topics.push(topic))

        await ActivityLog.create({
            id: course.id,
            name: 'Course',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })

        res.render('student/coursePreview', { User: req.user, course, CourseDetails, viewCourse: true, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:courseAssignId/:topicId', async (req, res) => {
    try {
        const course = await CourseAssignedToStudent.findOne({
            where: {
                id: req.params.courseAssignId,
                userId: req.user.id
            }
        })

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        if (new Date(course.expiresAt) < new Date()) {
            req.flash('error', 'Course Already Expired!')
            res.redirect('/student/courses')
            return
        }

        const foundCourse = await Course.findOne({
            where: {
                id: course.courseId
            }
        })

        if (!foundCourse) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        const [[foundTopic]] = await MySql.query('SELECT t.id as topicId, u.id as unitId, t.serialNumber as serialNumber, t.name as name, t.objectResourceId as objectResourceId, t.outcome as outcome, t.duration as duration  FROM (SELECT id, unitNumber, courseId FROM units WHERE courseId = ?) u INNER JOIN topics t ON t.unitId = u.id WHERE t.id = ?', { replacements: [foundCourse.id, req.params.topicId] })

        if (!foundTopic) {
            req.flash('error', 'Topic Not Found!')
            res.redirect('/student/courses')
            return
        }

        const [studentTopicTracking, courseContent] = await async.parallel([
            async () => await StudentCourseTopicTracking.findOne({
                where: {
                    courseAssignedToStudentId: req.params.courseAssignId,
                    topicId: foundTopic.topicId
                }
            }),
            async () => {
                const content = await redisGet(`courseContent${foundTopic.objectResourceId}`)
                if (content)
                    return content
                const result = await fetch(`${process.env.PUPPETEER_URL}?url=https://ilor.itrackglobal.com/ilor/objects/${foundTopic.objectResourceId}/datastreams/index/content`)
                const json = await result.json()
                if (json.status === 200) {
                    const content = json.data
                    Redis.setex(`courseContent${foundTopic.objectResourceId}`, 21600, content)
                    return content
                } else
                    throw new Error(json.message || 'Something Went Wrong!')
            }
        ])

        if (studentTopicTracking)
            foundTopic.tracking = studentTopicTracking.toJSON()

        async.parallel([
            async () => await StudentCourseLog.create({
                user: req.user.id,
                college: req.user.college,
                course: foundCourse.id,
                unit: foundTopic.unitId,
                topic: foundTopic.topicId
            }),
            async () => await ActivityLog.create({
                id: foundTopic.topicId,
                name: 'Course Topic',
                type: 'View',
                user: req.user.id,
                timestamp: new Date()
            })
        ])

        res.render('student/courseDashboard', { User: req.user, topic: foundTopic, courseContent, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/markAsComplete', async (req, res) => {
    try {
        if (!req.body.topicId)
            return res.status(400).json({ status: 400, message: 'Topic Id is required!' })

        const foundTopic = await Topic.findOne({
            where: {
                id: req.body.topicId
            }
        })

        if (!foundTopic)
            return res.status(404).json({ status: 404, message: 'Topic Not Found!' })

        const topicId = foundTopic.id

        const [foundUnit, topics] = await async.parallel([
            async () => await Unit.findOne({
                where: {
                    id: foundTopic.unitId
                }
            }),
            async () => await Topic.findAll({
                where: {
                    unitId: foundTopic.unitId
                }
            })
        ])

        const courseId = foundUnit.courseId
        const unitId = foundUnit.id

        const foundCourseAssignedToStudent = await CourseAssignedToStudent.findOne({
            where: {
                userId: req.user.id,
                courseId,
                assigned: true,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        })

        if (!foundCourseAssignedToStudent)
            return res.status(400).json({ status: 400, message: 'Course Not Assigned to Student!' })

        const courseAssignedToStudentId = foundCourseAssignedToStudent.id

        await StudentCourseTopicTracking.findOrCreate({
            where: {
                courseAssignedToStudentId,
                topicId
            }
        })

        const completedTopics = await StudentCourseTopicTracking.findAll({
            where: {
                courseAssignedToStudentId,
                topicId: topics.map(topic => topic.id)
            }
        })

        if (completedTopics.length === topics.length) {
            await StudentCourseUnitTracking.create({
                courseAssignedToStudentId,
                unitId
            })
        }

        await ActivityLog.create({
            id: req.body.topicId,
            name: 'Course Topic',
            type: 'Complete',
            user: req.user.id,
            timestamp: new Date()
        })

        res.status(201).json({ status: 201 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!', error: err.toString() })
    }
})

module.exports = router
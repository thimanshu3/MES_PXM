const { Router } = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { College, Specialization } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const colleges = await College.findAll({
            attributes: ['id', 'name']
        })
        const specializations = await Specialization.findAll({
            attributes: ['id', 'name']
        })
        const semesters = [1, 2, 3, 4, 5, 6, 7, 8]
        res.render('admin/studentReportSelect', { User: req.user, colleges, specializations, semesters, courseTypes: ['IBM Courses', 'Academic Courses'] })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/')
    }
})

router.post('/', async (req, res) => {
    try {
        const { college, specialization, semester, courseType, from, to } = req.body
        if (!college) {
            req.flash('error', 'College is required!')
            res.redirect('/admin/studentReport')
            return
        }
        if (!specialization) {
            req.flash('error', 'Specialization is required!')
            res.redirect('/admin/studentReport')
            return
        }
        if (!semester) {
            req.flash('error', 'Semester is required!')
            res.redirect('/admin/studentReport')
            return
        }
        if (!from || !to) {
            req.flash('error', 'Start Date and End Date is required!')
            res.redirect('/admin/studentReport')
            return
        }
        if (!courseType) {
            req.flash('error', 'Course Type Date is required!')
            res.redirect('/admin/studentReport')
            return
        }
        const startDate = new Date(from)
        const endDate = new Date(to)
        if (!(startDate < endDate)) {
            req.flash('error', 'Start Date should be less than End Date')
            res.redirect('/admin/studentReport')
            return
        }

        const [foundCollege, foundSpecialization] = await async.parallel([
            async () => await College.findOne({ where: { id: college }, attributes: ['name'] }),
            async () => await Specialization.findOne({ where: { id: specialization }, attributes: ['name'] })
        ])
        if (!foundCollege) {
            req.flash('error', 'College Not Found')
            res.redirect('/admin/studentReport')
            return
        }
        if (!foundSpecialization) {
            req.flash('error', 'Specialization Not Found')
            res.redirect('/admin/studentReport')
            return
        }
        if (courseType === 'IBM Courses') {
            const [data] = await MySql.query('SELECT logs.id as id, logs.email as email, logs.firstName as firstName, logs.lastName as lastName, logs.contactNumber as contactNumber, logs.logId as logId, logs.loggedAt as loggedAt, c.id as courseId, c.name as courseName, u.id as unitId, u.unitNumber as unitNumber, t.id as topicId, t.serialNumber as topicSerialNumber, t.name as topicName FROM (SELECT s.id as id, s.email as email, s.firstName as firstName, s.lastName as lastName, s.contactNumber as contactNumber, scl.id as logId, scl.createdAt as loggedAt, scl.course as courseId, scl.unit as unitId, scl.topic as topicId FROM (SELECT id, email, firstName, lastName, contactNumber FROM users WHERE role = 3 AND college = ? AND specialization = ? AND semester = ?) s INNER JOIN (SELECT * FROM studentCourseLogs WHERE college = ? AND createdAt > ? AND createdAt < ? ORDER BY createdAt DESC) scl ON s.id = scl.user) logs INNER JOIN courses c ON c.id = logs.courseId INNER JOIN units u ON u.id = logs.unitId INNER JOIN topics t ON t.id = logs.topicId ORDER BY logs.id', { replacements: [college, specialization, semester, college, from, to] })
            res.render('admin/studentReport', { User: req.user, data, college: foundCollege.name, specialization: foundSpecialization.name, semester, startDate, endDate, formatDateMoment, courseType })
        } else {
            const [data] = await MySql.query('SELECT logs.id as id, logs.email as email, logs.firstName as firstName, logs.lastName as lastName, logs.contactNumber as contactNumber, logs.logId as logId, logs.loggedAt as loggedAt, c.id as courseId, c.name as courseName, ch.id as chapterId, ch.number as chapterNumber, ch.name as chapterName, l.id as lessonId, l.number as lessonNumber, l.name as lessonName FROM (SELECT s.id as id, s.email as email, s.firstName as firstName, s.lastName as lastName, s.contactNumber as contactNumber, scl.id as logId, scl.createdAt as loggedAt, scl.academicCourse as academicCourseId, scl.chapter as chapterId, scl.lesson as lessonId FROM (SELECT id, email, firstName, lastName, contactNumber FROM users WHERE role = 3 AND college = ? AND specialization = ? AND semester = ?) s INNER JOIN (SELECT * FROM studentAcademicCourseLogs WHERE college = ? AND createdAt > ? AND createdAt < ? ORDER BY createdAt DESC) scl ON s.id = scl.user) logs INNER JOIN academicCourses c ON c.id = logs.academicCourseId INNER JOIN chapters ch ON ch.id = logs.chapterId INNER JOIN lessons l ON l.id = logs.lessonId ORDER BY logs.id', { replacements: [college, specialization, semester, college, from, to] })
            res.render('admin/studentReport', { User: req.user, data, college: foundCollege.name, specialization: foundSpecialization.name, semester, startDate, endDate, formatDateMoment, courseType })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/')
    }
})

module.exports = router
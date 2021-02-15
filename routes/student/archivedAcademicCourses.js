const { Router } = require('express')

const { MySql } = require('../../db')
const {
    AcademicCourseAssignedToStudent,
    AcademicCourse,
    User,
    Specialization
} = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/:id', async (req, res) => {
    try {
        const academicCourse = await AcademicCourseAssignedToStudent.findOne({
            where: {
                id: req.params.id,
                userId: req.user.id
            }
        })

        if (!academicCourse) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        if (new Date(academicCourse.expiresAt) > new Date()) {
            req.flash('error', 'Course Not Expired!')
            res.redirect('/student/courses')
            return
        }

        const course = (await AcademicCourse.findOne({
            where: {
                id: academicCourse.academicCourseId
            }
        })).toJSON()

        if (!course) {
            req.flash('error', 'Course Not Found!')
            res.redirect('/student/courses')
            return
        }

        const assignedBy = await User.findOne({
            where: {
                id: academicCourse.assignedBy
            },
            attributes: ['firstName', 'lastName']
        })

        const specialization = (await Specialization.findOne({
            where: {
                id: course.specializationId
            },
            attributes: ['name']
        })).toJSON()

        academicCourse.assignedByName = assignedBy.firstName + assignedBy.lastName
        academicCourse.semester = course.semester
        academicCourse.name = course.name
        academicCourse.description = course.description
        academicCourse.imageSource = course.imageSource
        academicCourse.specializationId = course.specializationId
        academicCourse.specializationName = specialization.name

        const [chapters] = await MySql.query('SELECT c.id as id, c.number as number, c.name as name, s.completedAt as completedAt FROM (SELECT * FROM chapters WHERE academicCourseId = ?) c LEFT JOIN (SELECT * FROM studentAcademicCourseChapterTrackings WHERE academicCourseAssignedToStudentId = ?) s ON c.id = s.chapterId ORDER BY c.number', { replacements: [academicCourse.academicCourseId, academicCourse.id] })

        const [lessons] = await MySql.query(`SELECT t.id as id, t.number as number, t.chapterId as chapterId, t.name as name, t.outcome as outcome, t.duration as duration, st.academicCourseAssignedToStudentId as academicCourseAssignedToStudentId, st.completedAt as completedAt FROM lessons t LEFT JOIN (SELECT * FROM studentAcademicCourseLessonTrackings WHERE academicCourseAssignedToStudentId = ?) st ON t.id = st.lessonId WHERE t.chapterId IN (${chapters.map(c => `'${c.id}'`)}) ORDER BY t.number`, { replacements: [academicCourse.id] })

        const CourseDetails = {}

        chapters.forEach(chapter => CourseDetails[chapter.id] = {
            ...chapter,
            lessons: []
        })

        lessons.forEach(lesson => CourseDetails[lesson.chapterId].lessons.push(lesson))

        academicCourse.chapters = Object.values(CourseDetails)

        console.log(JSON.stringify(academicCourse))
        res.render('student/academicCourse', { User: req.user, course: academicCourse, viewCourse: false, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router
const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/admin/dashboard'))

router.use('/dashboard', require('./dashboard'))
router.use('/colleges', require('./colleges'))
router.use('/addCollege', require('./addCollege'))
router.use('/faculties', require('./faculties'))
router.use('/addFaculty', require('./addFaculty'))
router.use('/students', require('./students'))
router.use('/addStudent', require('./addStudent'))
router.use('/user', require('./user'))
router.use('/courses', require('./courses'))
router.use('/addCourse', require('./addCourse'))
router.use('/specializations', require('./specializations'))
router.use('/loginReport', require('./loginReport'))
router.use('/assignCollegeCourse', require('./assignCollegeCourse'))
router.use('/assignStudentCourse', require('./assignStudentCourse'))
router.use('/studentReport', require('./studentReport'))
router.use('/academicCourses', require('./academicCourses'))
router.use('/studentAcademicCourseReport', require('./studentAcademicCourseReport'))

module.exports = router
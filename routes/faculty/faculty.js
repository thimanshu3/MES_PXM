const express = require('express')

const { checkUserFacultyHOD } = require('../../middlewares')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/faculty/dashboard'))

router.use('/dashboard', require('./dashboard'))
router.use('/students', require('./students'))
router.use('/courses', require('./courses'))
router.use('/academicCourses', require('./academicCourses'))
router.use('/addAcademicCourse', require('./addAcademicCourse'))
router.use('/assignStudent', require('./assignStudent'))
router.use('/addQuiz', require('./addQuiz'))
router.use('/quiz', require('./quiz'))
router.use('/assignQuiz', require('./assignQuiz'))
router.use('/quizAssignments', require('./quizAssignments'))
router.use('/faculties', checkUserFacultyHOD, require('./faculties'))
router.use('/assignFaculty', checkUserFacultyHOD, require('./assignFaculty'))
router.use('/dropzone', require('./dropzone'))
router.use('/loginReport', checkUserFacultyHOD, require('./loginReport'))

module.exports = router
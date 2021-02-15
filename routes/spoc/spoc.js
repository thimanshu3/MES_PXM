const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/spoc/dashboard'))

router.use('/dashboard', require('./dashboard'))
router.use('/students', require('./students'))
router.use('/faculties', require('./faculties'))
router.use('/courses', require('./courses'))
router.use('/loginReport', require('./loginReport'))
router.use('/assignCourse', require('./assignCourse'))
router.use('/assignFaculty', require('./assignFaculty'))
router.use('/academicCourses', require('./academicCourses'))
router.use('/quizAssignments', require('./quizAssignments'))

module.exports = router
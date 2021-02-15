const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/student/dashboard'))

router.use('/dashboard', require('./dashboard'))
router.use('/college', require('./college'))
router.use('/courses', require('./courses'))
router.use('/archivedCourses', require('./archivedCourses'))
router.use('/faq', require('./faq'))
router.use('/academicCourses', require('./academicCourses'))
router.use('/archivedAcademicCourses', require('./archivedAcademicCourses'))
router.use('/quiz', require('./quiz'))
router.use('/achievements', require('./achievements'))

module.exports = router
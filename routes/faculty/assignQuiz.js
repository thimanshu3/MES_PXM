const { Router } = require('express')
const async = require('async')

const {
    Quiz,
    FacultySemesterAssignment,
    FacultySpecializationAssignment,
    Specialization,
    User,
    QuizAssignment,
    QuizAssignmentResponse,
    ActivityLog
} = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const allQuiz = await Quiz.aggregate([
            {
                $match: {
                    creator: req.user.id,
                    isPublished: true
                }
            },
            {
                $project: {
                    name: 1,
                    duration: 1,
                    numberOfQuestions: {
                        $size: '$questions'
                    },
                    publishedAt: 1
                }
            }
        ])
        let allSemesters, allSpecializations

        if (!req.user.isHOD) {
            const [assignedSemesters, assignedSpecializations] = await async.parallel([
                async () => await FacultySemesterAssignment.findAll({
                    where: {
                        facultyId: req.user.id,
                        active: true
                    }
                }),
                async () => await FacultySpecializationAssignment.findAll({
                    where: {
                        facultyId: req.user.id,
                        active: true
                    }
                })
            ])

            allSemesters = assignedSemesters.map(s => s.semester)
            allSpecializations = assignedSpecializations.map(s => s.specialization)
        } else {
            allSemesters = [1, 2, 3, 4, 5, 6, 7, 8]
            allSpecializations = [req.user.hodSpecializationId]
        }

        const [students, Specializations] = await async.parallel([
            async () => await User.findAll({
                where: {
                    role: 3,
                    college: req.user.college,
                    semester: allSemesters,
                    specialization: allSpecializations,
                    active: true
                },
                attributes: ['id', 'firstName', 'lastName', 'specialization', 'semester'],
                order: [
                    ['firstName', 'ASC']
                ]
            }),
            async () => await Specialization.findAll()
        ])
        const specializations = {}
        Specializations.forEach(s => specializations[s.id] = s.name)
        students.forEach(s => s.specialization = specializations[s.specialization])
        res.render('faculty/assignQuiz', { User: req.user, students, allQuiz, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/', async (req, res) => {
    try {
        const { quizId, studentIds, title, start, end } = req.body
        if (!quizId) return res.status(400).json({ status: 400, message: 'Quiz is required!' })
        if (!studentIds || !Array.isArray(studentIds) || !studentIds.length) return res.status(400).json({ status: 400, message: 'Students are required!' })
        if (!title) return res.status(400).json({ status: 400, message: 'Assignment title is required!' })
        if (!start || !end) return res.status(400).json({ status: 400, message: 'Start & end date is required!' })
        const quiz = await Quiz.findOne({ _id: quizId, creator: req.user.id, isPublished: true })
        if (!quiz) return res.status(400).json({ status: 400, message: 'Quiz not found!' })
        const now = new Date()
        const startDate = new Date(start)
        const endDate = new Date(end)
        if (
            startDate &&
            endDate &&
            startDate.getTime() > now.getTime() &&
            endDate.getTime() > now.getTime() &&
            endDate.getTime() > startDate.getTime() &&
            (endDate.getTime() - startDate.getTime()) >= (quiz.duration * 60 * 1000)
        ) {
            const quizAssignment = await QuizAssignment.create({
                title,
                start: startDate,
                end: endDate,
                collegeId: req.user.college,
                quizId,
                assignedBy: req.user.id,
                numberOfParticipants: studentIds.length,
                quizName: quiz.name,
                quizImageSource: quiz.imageSource,
                numberOfQuestions: quiz.questions.length
            })
            const questionResponses = quiz.questions.map(q => ({
                questionId: q._id,
                selectedOptions: [],
                isAttempted: false,
                isCorrect: false
            }))
            const quizAssignmentResponses = studentIds.map(sid => ({
                quizId,
                quizAssignmentId: quizAssignment.id,
                userId: sid,
                quizDuration: quiz.duration,
                totalQuestions: quiz.questions.length,
                inCorrectQuestions: quiz.questions.length,
                questionResponses
            }))
            await async.parallel([
                async () => await QuizAssignmentResponse.insertMany(quizAssignmentResponses),
                async () => await ActivityLog.create({
                    id: quizAssignment.id,
                    name: 'Quiz Assignment',
                    type: 'Create',
                    user: req.user.id,
                    timestamp: new Date()
                })
            ])
            return res.status(201).json({ status: 201, message: 'Assigned Successfully!', redirect: '/faculty/quizAssignments/' + quizAssignment.id })
        } else res.status(400).json({ status: 400, message: 'Invalid start & end date!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router
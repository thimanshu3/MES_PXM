const { Router } = require('express')
const async = require('async')

const { QuizAssignment, Quiz, QuizAssignmentResponse, User, Specialization, ActivityLog } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const quizAssignments = await QuizAssignment.findAll({
            where: {
                assignedBy: req.user.id
            },
            order: [
                ['start', 'ASC']
            ]
        })
        const now = Date.now()
        const upcoming = []
        const past = []
        const live = []
        quizAssignments.forEach(qa => {
            if (now < qa.start.getTime()) upcoming.push(qa)
            else if (now > qa.end.getTime()) past.push(qa)
            else if (now > qa.start.getTime() && now < qa.end.getTime()) live.push(qa)
            qa.createdBy = req.user.firstName + ' ' + req.user.lastName
        })
        res.render('faculty/quizAssignments', { User: req.user, upcoming, past, live, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const quizAssignment = await QuizAssignment.findOne({
            where: {
                id: req.params.id,
                assignedBy: req.user.id
            }
        })
        if (!quizAssignment) {
            req.flash('error', 'Quiz Assignment not found!')
            res.redirect('/faculty/quizAssignments')
            return
        }
        const [quiz, quizAssignmentResponses, specializations] = await async.parallel([
            async () => await Quiz.findOne({
                _id: quizAssignment.quizId
            }),
            async () => await QuizAssignmentResponse.find({
                quizAssignmentId: quizAssignment.id
            }).sort({ correctQuestions: -1 }),
            async () => await Specialization.findAll()
        ])
        const specialization = {}
        specializations.forEach(s => {
            specialization[s.id] = s.name
        })
        const users = await User.findAll({
            where: {
                id: quizAssignmentResponses.map(qar => qar.userId)
            },
            attributes: ['id', 'firstName', 'lastName', 'semester', 'specialization']
        })
        const now = Date.now()
        if (now < quizAssignment.start.getTime()) quizAssignment.type = 'upcoming'
        else if (now > quizAssignment.end.getTime()) quizAssignment.type = 'past'
        else if (now > quizAssignment.start.getTime() && now < quizAssignment.end.getTime()) quizAssignment.type = 'live'
        quizAssignmentResponses.forEach(qar => {
            const user = users.find(u => u.id === qar.userId)
            qar.name = user.firstName + ' ' + user.lastName
            qar.semester = user.semester
            qar.specialization = specialization[user.specialization]
            if (qar.end && now < qar.end.getTime()) {
                qar.end = undefined
                qar.duration = undefined
            }
        })
        await ActivityLog.create({
            id: req.params.id,
            name: 'Quiz Assignment',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/quizAssignment', { User: req.user, quiz, quizAssignment, quizAssignmentResponses, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id/:quizAssignmentResponseId', async (req, res) => {
    try {
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({ _id: req.params.quizAssignmentResponseId, quizAssignmentId: req.params.id })
        if (!quizAssignmentResponse) {
            req.flash('error', 'Quiz not found!')
            res.redirect('/student/quiz')
        }
        const [quizAssignment, quiz] = await async.parallel([
            async () => await QuizAssignment.findOne({
                where: {
                    id: req.params.id,
                    assignedBy: req.user.id
                }
            }),
            async () => await Quiz.findOne({ _id: quizAssignmentResponse.quizId, creator: req.user.id })
        ])
        if (!quizAssignment || !quiz) {
            req.flash('error', 'Quiz not found!')
            res.redirect('/student/quiz')
            return
        }
        await ActivityLog.create({
            id: req.params.quizAssignmentResponseId,
            name: 'Quiz Assignment Response',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/quizQuestionsReview', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router
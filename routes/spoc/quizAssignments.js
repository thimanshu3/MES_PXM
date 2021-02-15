const { Router } = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { QuizAssignment, Quiz, QuizAssignmentResponse, User, Specialization, ActivityLog } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const [quizAssignments] = await MySql.query('SELECT * FROM (SELECT * FROM quizAssignments WHERE collegeId = ?) qa INNER JOIN (SELECT id as userId, firstName as firstName, lastName as lastName from users) u ON qa.assignedBy = u.userId ORDER BY start ASC', { replacements: [req.user.college] })
        const now = Date.now()
        const upcoming = []
        const past = []
        const live = []
        quizAssignments.forEach(qa => {
            if (now < qa.start.getTime()) upcoming.push(qa)
            else if (now > qa.end.getTime()) past.push(qa)
            else if (now > qa.start.getTime() && now < qa.end.getTime()) live.push(qa)
            qa.createdBy = qa.firstName + ' ' + qa.lastName
        })
        res.render('spoc/quizAssignments', { User: req.user, upcoming, past, live, formatDateMoment })
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
                collegeId: req.user.college
            }
        })
        if (!quizAssignment) {
            req.flash('error', 'Quiz Assignment not found!')
            res.redirect('/spoc/quizAssignments')
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
        res.render('spoc/quizAssignment', { User: req.user, quiz, quizAssignment, quizAssignmentResponses, formatDateMoment })
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
                    collegeId: req.user.college
                }
            }),
            async () => await Quiz.findOne({ _id: quizAssignmentResponse.quizId })
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
        res.render('spoc/quizQuestionsReview', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router
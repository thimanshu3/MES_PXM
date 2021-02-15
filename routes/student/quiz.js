const { Router } = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { Quiz, QuizAssignment, QuizAssignmentResponse, ActivityLog } = require('../../models')
const { formatDateMoment } = require('../../util')

const router = Router()

router.get('/', async (req, res) => {
    try {
        const quizAssignmentResponses = await QuizAssignmentResponse.find({ userId: req.user.id }, {
            quizAssignmentId: 1,
            isSubmitted: 1
        })
        const quizAssignmentIds = quizAssignmentResponses.map(qar => qar.quizAssignmentId)
        if (!quizAssignmentIds.length) {
            res.render('student/allQuiz', { User: req.user, upcoming: [], past: [], live: [] })
            return
        }
        const [quizAssignments] = await MySql.query(`SELECT qa.id as quizAssignmentId, qa.title as title, qa.start as start, qa.end as end, qa.quizId as quizId, qa.assignedBy as assignedBy, qa.numberOfParticipants as numberOfParticipants, qa.quizName as quizName, qa.quizImageSource as quizImageSource, qa.numberOfQuestions as numberOfQuestions, qa.createdAt as createdAt, u.firstName as firstName, u.lastName as lastName FROM (SELECT * FROM quizAssignments WHERE id IN (${'"' + quizAssignmentIds.join('","') + '"'}) ORDER BY start ASC) qa INNER JOIN (SELECT id, firstName, lastName FROM users) u ON qa.assignedBy = u.id`)
        const now = Date.now()
        const upcoming = []
        const past = []
        const live = []
        quizAssignments.forEach(qa => {
            const foundQAR = quizAssignmentResponses.find(qar => qar.quizAssignmentId === qa.quizAssignmentId)
            qa.id = foundQAR._id
            qa.start = new Date(qa.start)
            qa.end = new Date(qa.end)
            qa.createdAt = new Date(qa.createdAt)
            if (now < qa.start.getTime()) upcoming.push(qa)
            else if (now > qa.end.getTime()) past.push(qa)
            else if (now > qa.start.getTime() && now < qa.end.getTime()) live.push(qa)
            qa.createdBy = qa.firstName + ' ' + qa.lastName
        })
        res.render('student/allQuiz', { User: req.user, upcoming, past, live, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({ _id: req.params.id, userId: req.user.id }, { 'quizAssignmentResponse.questionResponses': 0 })
        if (!quizAssignmentResponse) {
            req.flash('error', 'Quiz not found!')
            res.redirect('/student/quiz')
        }
        const quizAssignment = await QuizAssignment.findOne({
            where: {
                id: quizAssignmentResponse.quizAssignmentId
            }
        })
        const now = Date.now()
        if (now < quizAssignment.start.getTime()) quizAssignment.type = 'upcoming'
        else if (now > quizAssignment.end.getTime()) quizAssignment.type = 'past'
        else if (now > quizAssignment.start.getTime() && now < quizAssignment.end.getTime()) quizAssignment.type = 'live'
        await ActivityLog.create({
            id: req.params.id,
            name: 'Quiz',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        if (quizAssignment.type !== 'past' && !quizAssignmentResponse.isForceQuitted && (!quizAssignmentResponse.end || (quizAssignmentResponse.end && now < quizAssignmentResponse.end.getTime()))) {
            const quiz = await Quiz.findOne({ _id: quizAssignmentResponse.quizId }, { questions: 0 })
            res.render('student/quizPreview', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment })
        }
        else {
            const quiz = await Quiz.findOne({ _id: quizAssignmentResponse.quizId })
            res.render('student/quizResult', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/questionsReview/:id', async (req, res) => {
    try {
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({ _id: req.params.id, userId: req.user.id })
        if (!quizAssignmentResponse) {
            req.flash('error', 'Quiz not found!')
            res.redirect('/student/quiz')
        }
        const quizAssignment = await QuizAssignment.findOne({
            where: {
                id: quizAssignmentResponse.quizAssignmentId
            }
        })
        const now = Date.now()
        if (now < quizAssignment.start.getTime()) quizAssignment.type = 'upcoming'
        else if (now > quizAssignment.end.getTime()) quizAssignment.type = 'past'
        else if (now > quizAssignment.start.getTime() && now < quizAssignment.end.getTime()) quizAssignment.type = 'live'
        await ActivityLog.create({
            id: req.params.id,
            name: 'Quiz Questions Review',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        if (quizAssignment.type !== 'past' && !quizAssignmentResponse.isForceQuitted && (!quizAssignmentResponse.end || (quizAssignmentResponse.end && now < quizAssignmentResponse.end.getTime()))) {
            res.redirect('/student/quiz/' + req.params.id)
        }
        else {
            const quiz = await Quiz.findOne({ _id: quizAssignmentResponse.quizId })
            res.render('student/quizQuestionsReview', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment })
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/play/:id', async (req, res) => {
    try {
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({ _id: req.params.id, userId: req.user.id }, { 'questionResponses.isCorrect': 0 })
        if (!quizAssignmentResponse) {
            req.flash('error', 'Quiz not found!')
            res.redirect('/student/quiz')
        }
        const quizAssignment = await QuizAssignment.findOne({
            where: {
                id: quizAssignmentResponse.quizAssignmentId
            }
        })
        const now = Date.now()
        if (now < quizAssignment.start.getTime()) {
            req.flash('error', 'Quiz has not started yet!')
            res.redirect('/student/quiz/' + req.params.id)
        }
        else if (now > quizAssignment.end.getTime()) {
            req.flash('error', 'Quiz has already ended!')
            res.redirect('/student/quiz/' + req.params.id)
        }
        else if (now > quizAssignment.start.getTime() && now < quizAssignment.end.getTime()) {
            const quiz = await Quiz.findOne({ _id: quizAssignmentResponse.quizId }, { 'questions.choices.isCorrect': 0 })
            if (quizAssignmentResponse.isForceQuitted) {
                req.flash('error', 'You have been barred from taking rest of the quiz!')
                res.redirect('/student/quiz')
                return
            } else if (!quizAssignmentResponse.isStarted) {
                quizAssignmentResponse.isStarted = true
                const startTime = new Date()
                let endTime = new Date(startTime)
                endTime.setUTCMinutes(endTime.getUTCMinutes() + quiz.duration)
                if (endTime.getTime() > quizAssignment.end.getTime()) endTime = new Date(quizAssignment.end)
                const applicableDuration = Math.floor((endTime.getTime() - startTime.getTime()) / 60000)
                if (applicableDuration < 1) {
                    req.flash('error', 'You have been too late to start!')
                    res.redirect('/student/quiz')
                    return
                }
                quizAssignmentResponse.start = startTime
                quizAssignmentResponse.end = endTime
                quizAssignmentResponse.duration = applicableDuration
                await quizAssignmentResponse.save()
                res.render('student/quizMania', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment, remainingDuration: applicableDuration })
            } else {
                const remainingDuration = Math.floor((quizAssignmentResponse.end.getTime() - Date.now()) / 60000)
                if (remainingDuration < 1) {
                    req.flash('error', 'You have been too late to resume!')
                    res.redirect('/student/quiz')
                    return
                }
                await ActivityLog.create({
                    id: req.params.id,
                    name: 'Quiz',
                    type: 'Attempt',
                    user: req.user.id,
                    timestamp: new Date()
                })
                res.render('student/quizMania', { User: req.user, quiz, quizAssignment, quizAssignmentResponse, formatDateMoment, remainingDuration })
            }
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id/questionResponses/:questionId', async (req, res) => {
    try {
        const { id, questionId } = req.params
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({
            _id: id,
            userId: req.user.id,
            isStarted: true,
            isForceQuitted: false,
            end: {
                $gt: new Date()
            }
        }, {
            _id: 0,
            'questionResponses.questionId': 1,
            'questionResponses.selectedOptions': 1
        })
        if (!quizAssignmentResponse) return res.status(404).json({ status: 404, message: 'Not Found!' })
        const fqr = quizAssignmentResponse.questionResponses.find(qar => qar.questionId.toString() === questionId)
        if (!fqr) return res.status(404).json({ status: 404, message: 'Not Found!' })
        res.json({ data: fqr })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.patch('/:id/questionResponses/:questionId', async (req, res) => {
    try {
        const { id, questionId } = req.params
        const { selectedOptions } = req.body
        if (!selectedOptions || !Array.isArray(selectedOptions))
            return res.status(400).json({ status: 400, message: 'Selected options is required!' })
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({
            _id: id,
            userId: req.user.id,
            isStarted: true,
            isForceQuitted: false,
            end: {
                $gt: new Date()
            }
        })
        if (!quizAssignmentResponse) return res.status(404).json({ status: 404, message: 'Not Found!' })
        const quiz = await Quiz.findOne({ _id: quizAssignmentResponse.quizId })
        if (!quiz) return res.status(404).json({ status: 404, message: 'Not Found!' })
        const fqr = quizAssignmentResponse.questionResponses.find(qar => qar.questionId.toString() === questionId)
        if (!fqr) return res.status(404).json({ status: 404, message: 'Not Found!' })
        fqr.selectedOptions = selectedOptions
        let correctQuestions = 0
        let inCorrectQuestions = quiz.questions.length
        let questionsAttempted = 0
        quiz.questions.forEach((q, i) => {
            const questionResponse = quizAssignmentResponse.questionResponses[i]
            if (questionResponse.selectedOptions.length) {
                questionResponse.isAttempted = true
                questionsAttempted++
            } else questionResponse.isAttempted = false
            let isCorrect = false
            const correctOnes = q.choices.filter(c => c.isCorrect === true).map(c => c._id.toString())
            if (questionResponse.selectedOptions.length === correctOnes.length) {
                let flag = true
                questionResponse.selectedOptions.forEach(so => {
                    if (!correctOnes.includes(so.toString())) flag = false
                })
                if (flag) isCorrect = true
            }
            questionResponse.isCorrect = isCorrect
            if (questionResponse.isCorrect) {
                correctQuestions++
                inCorrectQuestions--
            }
        })
        quizAssignmentResponse.correctQuestions = correctQuestions
        quizAssignmentResponse.inCorrectQuestions = inCorrectQuestions
        quizAssignmentResponse.questionsAttempted = questionsAttempted
        await quizAssignmentResponse.save()
        res.json({ status: 200, quizAssignmentResponse })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.put('/tabChanges', async (req, res) => {
    try {
        const { hiddenFrom, hiddenTo, quizAssignmentResponseId } = req.body
        if (!hiddenFrom || !hiddenTo || !quizAssignmentResponseId) return res.status(400).json({ status: 404, message: 'hiddenFrom, hiddenTo & quizAssignmentResponseId is required!' })
        const start = new Date(hiddenFrom)
        const end = new Date(hiddenTo)
        await async.parallel([
            async () => await QuizAssignmentResponse.updateOne({
                _id: quizAssignmentResponseId,
                userId: req.user.id,
                isStarted: true,
                isForceQuitted: false,
                end: {
                    $gt: new Date()
                }
            }, {
                $push: {
                    tabChanges: { start, end, timespent: end.getTime() - start.getTime() }
                }
            }),
            async () => await ActivityLog.create({
                id: quizAssignmentResponseId,
                name: 'Quiz',
                type: 'Tab Change',
                user: req.user.id,
                timestamp: new Date()
            })
        ])
        res.send({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.delete('/endQuiz/:id', async (req, res) => {
    try {
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({
            _id: req.params.id,
            userId: req.user.id,
            isStarted: true,
            isForceQuitted: false,
            end: {
                $gt: new Date()
            }
        })
        if (!quizAssignmentResponse) return res.status(404).json({ status: 404, message: 'Not Found!' })
        const end = new Date()
        quizAssignmentResponse.end = end
        const startTime = quizAssignmentResponse.start.getTime()
        const endTime = end.getTime()
        quizAssignmentResponse.duration = Math.round((endTime - startTime) / 60000)
        await async.parallel([
            async () => await quizAssignmentResponse.save(),
            async () => await ActivityLog.create({
                id: req.params.id,
                name: 'Quiz',
                type: 'End',
                user: req.user.id,
                timestamp: new Date()
            })
        ])

        res.send({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.delete('/forceEndQuiz/:id', async (req, res) => {
    try {
        const quizAssignmentResponse = await QuizAssignmentResponse.findOne({
            _id: req.params.id,
            userId: req.user.id,
            isStarted: true,
            isForceQuitted: false,
            end: {
                $gt: new Date()
            }
        })
        if (!quizAssignmentResponse) return res.status(404).json({ status: 404, message: 'Not Found!' })
        const end = new Date()
        quizAssignmentResponse.end = end
        const startTime = quizAssignmentResponse.start.getTime()
        const endTime = end.getTime()
        quizAssignmentResponse.duration = Math.round((endTime - startTime) / 60000)
        quizAssignmentResponse.isForceQuitted = true
        await async.parallel([
            async () => await quizAssignmentResponse.save(),
            async () => await ActivityLog.create({
                id: req.params.id,
                name: 'Quiz',
                type: 'Force End',
                user: req.user.id,
                timestamp: new Date()
            })
        ])

        res.send({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router
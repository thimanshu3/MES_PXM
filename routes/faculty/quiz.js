const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')
const async = require('async')

const { Quiz, ActivityLog } = require('../../models')
const { formatDateMoment, random } = require('../../util')

const uploadStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const excelFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const excelUpload = multer({
    storage: uploadStorage,
    fileFilter: excelFilter
})

const router = Router()

router.get('/', async (req, res) => {
    try {
        const allQuiz = await Quiz.aggregate([
            {
                $match: {
                    creator: req.user.id
                }
            },
            {
                $project: {
                    name: 1,
                    duration: 1,
                    imageSource: 1,
                    isPublished: 1,
                    numberOfQuestions: {
                        $size: '$questions'
                    },
                    createdAt: 1,
                    publishedAt: 1,
                    updatedAt: 1
                }
            }
        ])
        res.render('faculty/allQuiz', { User: req.user, allQuiz, formatDateMoment })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user.id })
        if (!quiz) {
            req.flash('error', 'Quiz Not Found!')
            res.redirect('/faculty/quiz')
            return
        }
        await ActivityLog.create({
            id: req.params.id,
            name: 'Quiz',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/quiz', { User: req.user, quiz })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/preview/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user.id })
        if (!quiz) {
            req.flash('error', 'Quiz Not Found!')
            res.redirect('/faculty/quiz')
            return
        }
        await ActivityLog.create({
            id: req.params.id,
            name: 'Quiz',
            type: 'Preview',
            user: req.user.id,
            timestamp: new Date()
        })
        res.render('faculty/quizPreview', { User: req.user, quiz })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/:quizId/questions/:questionId', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.quizId, creator: req.user.id }, { questions: 1 })
        if (!quiz) return res.status(404).json({ status: 404, message: 'Quiz Not Found!' })
        const question = quiz.questions.find(q => q._id.toString() === req.params.questionId)
        if (!question) return res.status(404).json({ status: 404, message: 'Question Not Found!' })
        await ActivityLog.create({
            id: req.params.questionId,
            name: 'Quiz Question',
            type: 'View',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200, question })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.delete('/:quizId/questions/:questionId', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.quizId, creator: req.user.id }, { isPublished: 1 })
        if (!quiz) return res.status(404).json({ status: 404, message: 'Quiz Not Found!' })
        if (quiz.isPublished) return res.status(400).json({ status: 400, message: 'Cannot delete question as quiz is published!' })
        await Quiz.updateOne({
            _id: req.params.quizId,
            creator: req.user.id
        }, {
            $pull: {
                questions: {
                    _id: req.params.questionId
                }
            }
        })
        await ActivityLog.create({
            id: req.params.questionId,
            name: 'Quiz Question',
            type: 'Delete',
            user: req.user.id,
            timestamp: new Date()
        })
        res.json({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

router.get('/addNewQuestion/:id', async (req, res) => {
    try {
        res.render('faculty/addQuestion', { User: req.user, quizId: req.params.id })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/:id/addQuestion', async (req, res) => {
    try {
        const { correctOption, correct, questionDescription } = req.body
        if (!questionDescription) {
            req.flash('error', 'questionDescription is required!')
            res.redirect('/faculty/quiz/' + req.params.id)
            return
        }
        const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user.id }, { isPublished: 1 })
        if (!quiz) return res.status(404).json({ status: 404, message: 'Quiz Not Found!' })
        if (quiz.isPublished) {
            req.flash('error', 'Cannot add question as quiz is published!')
            res.redirect('/faculty/quiz/' + req.params.id)
            return
        }
        const question = {
            text: questionDescription,
            choices: []
        }
        if (correct) {
            question.type = 'single'
            Object.keys(req.body).forEach(key => {
                if (key.includes('option-')) {
                    const choice = {
                        text: req.body[key],
                        isCorrect: false
                    }
                    const index = key.split('-')[1]
                    if (correct === index) choice.isCorrect = true
                    question.choices.push(choice)
                }
            })
        } else if (Array.isArray(correctOption) && correctOption.length > 1) {
            question.type = 'multi'
            Object.keys(req.body).forEach(key => {
                if (key.includes('option-')) {
                    const choice = {
                        text: req.body[key],
                        isCorrect: false
                    }
                    const index = key.split('-')[1]
                    if (correctOption.includes(index)) choice.isCorrect = true
                    question.choices.push(choice)
                }
            })
        }
        if (question.choices.length > 1) {
            let correctChoices = 0
            question.choices.forEach(choice => {
                if (choice.isCorrect) correctChoices++
            })
            if (question.type === 'single' || (question.type === 'multi' && correctChoices > 1 && correctChoices < question.choices.length)) {
                await async.parallel([
                    async () => await Quiz.updateOne({
                        _id: req.params.id,
                        creator: req.user.id
                    }, {
                        $push: { questions: question }
                    }),
                    async () => await ActivityLog.create({
                        id: req.params.id,
                        name: 'Quiz',
                        type: 'Create Question',
                        user: req.user.id,
                        timestamp: new Date()
                    })
                ])
                req.flash('success', 'Question added successfully!')
                res.redirect('/faculty/quiz/' + req.params.id)
                return
            }
        } else {
            req.flash('error', 'Please select option to create question')
            res.redirect('/faculty/quiz/' + req.params.id)
            return
        }
        req.flash('error', 'Invalid Details Provided')
        res.redirect('/faculty/quiz/' + req.params.id)
        return
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/:quizId/updateQuestion/:questionId', async (req, res) => {
    try {
        const { correct, questionDescription } = req.body
        if (!questionDescription) {
            req.flash('error', 'questionDescription is required!')
            res.redirect('/faculty/quiz/' + req.params.quizId)
            return
        }
        const quiz = await Quiz.findOne({ _id: req.params.quizId, creator: req.user.id }, { isPublished: 1 })
        if (!quiz) return res.status(404).json({ status: 404, message: 'Quiz Not Found!' })
        if (quiz.isPublished) {
            req.flash('error', 'Cannot add question as quiz is published!')
            res.redirect('/faculty/quiz/' + req.params.id)
            return
        }
        const question = {
            text: questionDescription,
            choices: []
        }
        if (correct && Array.isArray(correct) && correct.length > 1) {
            question.type = 'multi'
            Object.keys(req.body).forEach(key => {
                if (key.includes('option-')) {
                    const choice = {
                        text: req.body[key],
                        isCorrect: false
                    }
                    const index = key.split('-')[1]
                    if (correct.includes(index)) choice.isCorrect = true
                    question.choices.push(choice)
                }
            })
        } else if (correct) {
            question.type = 'single'
            Object.keys(req.body).forEach(key => {
                if (key.includes('option-')) {
                    const choice = {
                        text: req.body[key],
                        isCorrect: false
                    }
                    const index = key.split('-')[1]
                    if (correct === index) choice.isCorrect = true
                    question.choices.push(choice)
                }
            })
        }
        if (question.choices.length > 1) {
            let correctChoices = 0
            question.choices.forEach(choice => {
                if (choice.isCorrect) correctChoices++
            })
            if (question.type === 'single' || (question.type === 'multi' && correctChoices > 1 && correctChoices < question.choices.length)) {
                await Quiz.updateOne({
                    _id: req.params.quizId,
                    creator: req.user.id,
                    'questions._id': req.params.questionId
                }, {
                    $set: {
                        'questions.$.text': question.text,
                        'questions.$.type': question.type,
                        'questions.$.choices': question.choices
                    }
                })
                await ActivityLog.create({
                    id: req.params.questionId,
                    name: 'Quiz Question',
                    type: 'Update',
                    user: req.user.id,
                    timestamp: new Date()
                })
                req.flash('success', 'Question updated successfully!')
                res.redirect('/faculty/quiz/' + req.params.quizId)
                return
            }
        }
        req.flash('error', 'Invalid Details Provided')
        res.redirect('/faculty/quiz/' + req.params.id)
        return
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/:id/importQuestion', excelUpload.single('file'), async (req, res) => {
    try {
        if (!req.file || req.fileValidationError) {
            req.flash('error', 'Invalid File')
            res.redirect('/faculty/quiz/addNewQuestion/' + req.params.id)
            return
        }
        const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user.id })
        if (!quiz) {
            fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            req.flash('error', 'Questions Imported Successfully!')
            res.redirect('/faculty/quiz/addNewQuestion/' + req.params.id)
            return
        }
        if (quiz.isPublished) {
            fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
            req.flash('error', 'Cannot import questions as quiz is published!')
            res.redirect('/faculty/quiz/' + req.params.id)
            return
        }
        const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
        fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        if (excelData.length == 0 || excelData.length === 1) {
            req.flash('error', 'No Questions to Import')
            res.redirect('/faculty/quiz/addNewQuestion/' + req.params.id)
            return
        }
        excelData.shift()
        const questions = []
        excelData.forEach(row => {
            if (!row[1]) return
            const obj = {
                text: row[1],
                choices: [],
                type: 'single'
            }
            let count = 0
            for (let i = 2; i < 14; i += 2) {
                if (row[i]) {
                    const option = {
                        text: row[i],
                        isCorrect: (row[i + 1] || '').toLowerCase().includes('yes')
                    }
                    if (option.isCorrect) count++
                    obj.choices.push(option)
                }
            }
            if (obj.choices.length > 1 && count > 0 && count < obj.choices.length) {
                if (count > 1) obj.type = 'multi'
                questions.push(obj)
            }
        })
        if (!questions.length) {
            req.flash('error', 'No Valid Questions to Import')
            res.redirect('/faculty/quiz/addNewQuestion/' + req.params.id)
            return
        }
        quiz.questions = questions
        await async.parallel([
            async () => await quiz.save(),
            async () => await ActivityLog.create({
                id: req.params.id,
                name: 'Quiz',
                type: 'Import',
                user: req.user.id,
                timestamp: new Date()
            })
        ])
        req.flash('success', 'Questions Imported Successfully!')
        res.redirect('/faculty/quiz/' + req.params.id)
    } catch (err) {
        if (req.file) fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/publish/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ _id: req.params.id, creator: req.user.id })
        if (!quiz) return res.status(404).json({ status: 404, message: 'Quiz Not Found!' })
        if (quiz.isPublished) return res.status(400).json({ status: 400, message: 'Quiz is already published!' })
        quiz.isPublished = true
        quiz.publishedAt = new Date()
        await async.parallel([
            async () => await quiz.save(),
            async () => await ActivityLog.create({
                id: req.params.id,
                name: 'Quiz',
                type: 'Publish',
                user: req.user.id,
                timestamp: new Date()
            })
        ])
        res.json({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router
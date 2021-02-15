const { Router } = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const { Quiz, ActivityLog } = require('../../models')
const { random } = require('../../util')

const quizImageStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads/quizImages'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const imageFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const quizImageUpload = multer({
    storage: quizImageStorage,
    fileFilter: imageFilter
})

const router = Router()

router.get('/', (req, res) => {
    res.render('faculty/addQuiz', { User: req.user })
})

router.post('/', quizImageUpload.single('image'), async (req, res) => {
    if (req.fileValidationError) return res.json({ status: 400, message: req.fileValidationError })
    try {
        const { name, description, duration } = req.body
        if (!name || !description || !duration) {
            req.flash('error', 'name, description and duration is required!')
            res.redirect('/faculty/addQuiz')
            return
        }
        const newQuizObj = {
            name,
            description,
            duration,
            creator: req.user.id
        }
        if (req.file) newQuizObj.imageSource = req.file.filename
        const quiz = await Quiz.create(newQuizObj)
        await ActivityLog.create({
            id: quiz._id.toString(),
            name: 'Quiz',
            type: 'Create',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', 'Quiz Added Successfully!')
        res.redirect('/faculty/quiz/' + quiz._id)
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (req.file && req.file.filename)
            fs.unlink(`uploads/quizImages/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const async = require('async')

const { random } = require('../../util')
const { Dropzone, ActivityLog } = require('../../models')

const uploadStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads/dropzone'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const fileFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|mp4|mkv|pdf|xlsx|docx|ppt)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const fileUpload = multer({
    storage: uploadStorage,
    fileFilter
})

const router = express.Router()

router.get('/', async (req, res) => {
    try {
        const files = await Dropzone.find({ creator: req.user.id })
        res.render('faculty/dropzone', { User: req.user, files })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.post('/', fileUpload.single('file'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            req.flash('error', req.fileValidationError)
            res.redirect('/faculty/dropzone')
            return
        }
        if (!req.file) {
            req.flash('error', 'No File Uploaded')
            res.redirect('/faculty/dropzone')
            return
        }
        const f = await Dropzone.create({
            name: req.file.originalname,
            filename: req.file.filename,
            url: req.file.path,
            size: req.file.size,
            mimeType: req.file.mimetype,
            creator: req.user.id
        })
        await ActivityLog.create({
            id: f.id,
            name: 'Dropzone',
            type: 'Create',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', 'Uploaded Successfully!')
        res.redirect('/faculty/dropzone')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        fs.unlink(`uploads/dropzone/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.delete('/:id', async (req, res) => {
    try {
        const found = await Dropzone.findOne({ _id: req.params.id, creator: req.user.id })
        if (!found) return res.status(404).json({ status: 404, message: 'Not Found!' })
        fs.unlink(`uploads/dropzone/${found.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        await async.parallel([
            async () => await await found.remove(),
            async () => await ActivityLog.create({
                id: req.params.id,
                name: 'Dropzone',
                type: 'Delete',
                user: req.user.id,
                timestamp: new Date()
            })
        ])
        res.status(200).json({ status: 200 })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: 'Something Went Wrong!' })
    }
})

module.exports = router
const express = require('express')
const multer = require('multer')
const path = require('path')
const { random } = require('../../util')
const fetch = require('node-fetch')
const router = express.Router()

const uploadStorage = multer.diskStorage({
    destination: (req, file, next) => next(null, 'uploads'),
    filename: (req, file, next) => next(null, `${random(16).toLowerCase()}-${Date.now()}${path.extname(file.originalname)}`)
})

const excelFilter = (req, file, next) => {
    if (!file.originalname.match(/\.(csv)$/)) {
        req.fileValidationError = 'Invalid File Type!'
        return next(null, false)
    }
    next(null, true)
}

const excelUpload = multer({
    storage: uploadStorage,
    fileFilter: excelFilter
})

//Importing Raw Data
router.get('/', async (req, res) => { 
    res.render('admin/importrawdata', { User: req.user })
})

router.post('/', excelUpload.single('file'), async (req, res) => {
    const {fileName , description } = req.body

    if (req.fileValidationError) return res.json({ status: 400, message: req.fileValidationError })  
    await fetch('http://192.168.2.104:3000/matrix_item_logic', {
       method: 'POST',
       body: JSON.stringify({
           fileName,
           description,
           path: `uploads/${req.file.filename}`
       }),
        headers: {'Content-Type': 'application/json'}
    }).then(res => res.json())
        .then(json => res.json({ json, status: 200 }))
       .catch(err => res.json({ message: err.toString() || 'something went wrong', status: 500 }))
})


module.exports = router
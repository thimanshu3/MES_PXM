const { Op } = require('sequelize')
const express = require('express')
const bcrypt = require('bcryptjs')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')
const { random } = require('../../util')
const { formatDateMoment } = require('../../util')
const fetch = require('node-fetch')
const { MySql } = require('../../db')
const { addInputFieldSchema } = require('../../validation')
const { Router } = require('express')
const router = express.Router()

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

//Importing Raw Data
router.get('/', async (req, res) => { 
    res.render('admin/importrawdata', { User: req.user })
})

router.post('/', excelUpload.single('file'), async (req, res) => {
    const {fileName , description } = req.body

    if (req.fileValidationError) return res.json({ status: 400, message: req.fileValidationError })  

    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    if (excelData.length === 0) {
        fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        return res.json({ status: 400, message: 'no data to process in excel file' })
    }

   await fetch('', {
       method: 'POST',
       body: JSON.stringify({
           fileName,
           description,
           path: `uploads/${req.file.filename}`
       }),
        headers: {'Content-Type': 'application/json'}
    }).then(res => res.json())
        .then(json => console.log(json))
        .catch(err => console.log(err))
})


module.exports = router
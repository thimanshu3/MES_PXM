const { Op } = require('sequelize')
const express = require('express')
const bcrypt = require('bcryptjs')
const async = require('async')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')
const { random } = require('../../util')

const { MySql } = require('../../db')
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

router.get('/', async (req, res) => {
    
    const [fields] = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr, inputTypes.inputType from inputFields INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')
    res.render('admin/importAssistant', { User: req.user, fields, excelData: null, step: 'upload-file',  })
})

router.post('/', excelUpload.single('file'), async (req, res) => {
    if (!req.file) {
        req.flash('error', 'No File Uploaded')
        res.redirect('/admin/importassistant')
        return
    }
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/importassistant')
        return
    }
    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)


    if (excelData.length === 0) {
        req.flash('error', 'No Fields to map!')
        res.redirect('/admin/importassistant')
        return
    }
    try{
        const [fields] = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr, inputTypes.inputType from inputFields INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')
        res.render('admin/importAssistant', { User: req.user, excelData:excelData[0], fields, step: 'field-mapping' })
    }
    catch (err) {
        console.log(err);
    }
})

module.exports = router
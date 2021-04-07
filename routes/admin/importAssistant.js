const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const readXlsxFile = require('read-excel-file/node')
const { productTable } = require('../../models')
const { random } = require('../../util')

const { MySql } = require('../../db')
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
    const vendor = await productTable.findAll()
    res.render('admin/importAssistant', { User: req.user, fields, vendor })
})

router.post('/', excelUpload.single('file'), async (req, res) => {
    try {
        if (req.fileValidationError) {
            req.flash('error', req.fileValidationError)
            res.redirect('/admin/addUser')
            return
        }
        let { mappingsData } = req.body
        mappingsData = JSON.parse(mappingsData)
        if (!Array.isArray(mappingsData) && !mappingsData.length) {
            return res.status(400).json({ message: 'No Mappings' })
        }
        console.log(mappingsData)
        const excelDataRaw = await readXlsxFile(`uploads/${req.file.filename}`)
        fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
        const headers = Object.values(excelDataRaw.shift()).map(v => v.trim())
        const excelData = []
        excelDataRaw.forEach(d => {
            const obj = {}
            headers.forEach((h, i) => {
                obj[h] = d[i]
            })
            excelData.push(obj)
        })
        const data = []
        excelData.forEach(sd => {
            const obj = {}
            mappingsData.forEach(md => {
                const { from, to } = md
                if (from && to && from.trim() && to.trim()) {
                    obj[to.trim()] = sd[from.trim()]
                    if (md.default && !obj[to.trim()]) obj[to.trim()] = md.default
                    if (md.fieldId) obj.fieldId = md.fieldId
                }
            })
            data.push(obj)
        })
        res.json(data)
    } catch (err) {
        console.error(err)
    }
})

module.exports = router

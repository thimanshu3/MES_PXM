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
const { inputFields, inputTypes, ActivityLog } = require('../../models')
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

router.get('/', async (req, res) => {
    try{
    const inputType = await inputTypes.findAll()
    const inputField = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description ,users.firstName as firstName, users.lastName as lastName, inputTypes.inputType from inputFields INNER JOIN users  ON users.id = inputFields.createdBy INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')
    res.render('admin/inputField', { User: req.user, inputField, inputType })
} catch (err) {
    console.error('\x1b[31m%s\x1b[0m', err)
    req.flash('error', 'Something Went Wrong!')
    res.redirect('/')
}
})


router.post('/add', async (req, res) => {
    const { label, description, type } = req.body
    if (!label) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/inputField')
        return
    }
    if (!description) {
        req.flash('error', 'description is required!')
        res.redirect('/admin/inputField')
        return
    }
    if (!type) {
        req.flash('error', 'type is required!')
        res.redirect('/admin/inputField')
        return
    }
    try {
        const inputField = await inputFields.create({ label, typeOfField: type, description, createdBy: req.user.id })
        await ActivityLog.create({
            id: inputField.id,
            name: 'input Field',
            type: 'Add',
            user: req.user.id,
            timestamp: new Date()
        })
        req.flash('success', `${inputField.label} Added Successfully!`)
        res.redirect('/admin/inputField')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/inputField')
    }
})

router.post('/import', excelUpload.single('file'), async (req, res) => {
    if (req.fileValidationError) {
        req.flash('error', req.fileValidationError)
        res.redirect('/admin/inputfield')
        return
    }

    const excelData = await readXlsxFile(`uploads/${req.file.filename}`)
    fs.unlink(`uploads/${req.file.filename}`, err => err ? console.error('\x1b[31m%s\x1b[0m', err) : undefined)
    excelData.shift()

    if (excelData.length === 0) {
        req.flash('error', 'No Field Items to Add!')
        res.redirect('/admin/inputfield')
        return
    }

    Promise
        .all(excelData.map(async (row, index) => {
            try {
                const found = await inputTypes.findOne({
                    where: {
                        inputType: row[1]
                    }
                })
                if (found) {
                    row[1] = found.id
                }
                else{
                    throw new Error(`wrong input type given at Sr. No. ${++index}`)
                }
                return {
                    ...(await addInputFieldSchema.validateAsync({
                        label: row[0],
                        typeOfField: row[1],
                        description: row[2],
                        createdBy: req.user.id
                    }))
                }
            } catch (err) {
                throw new Error(err.toString() + ` at Sr. No. ${++index}`)
            }
        }))
        .then(async data => {
            let transaction

            try {
                transaction = await MySql.transaction()
                await inputFields.bulkCreate(data, { transaction })
                await transaction.commit()
                req.flash('success', 'Item Fields Import Completed!')
                res.redirect(`/admin/inputfield`)
            } catch (err) {
                console.log(err)
                if (transaction)
                    await transaction.rollback()
                if (err.name === 'SequelizeUniqueConstraintError')
                    req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
                else
                    req.flash('error', err.toString())
                res.redirect(`/admin/inputfield`)
            }
        })

        .catch(err => {
            console.log(err)
            req.flash('error', err.toString() || 'Validation Error!')
            res.redirect('/admin/inputfield')
        })
})

router.delete('/:id', async (req, res) => {
    const foundField = await inputFields.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundField)
        return res.status(404).json({ message: 'Field Not Found!' })

    // if (foundField.role === 0)
    //     return res.status(400).json({ message: 'Cannot Deactive Admin' })

    foundField.active = !foundField.active
    await foundField.save()

    res.json({ status: 200, message: `Field ${foundField.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundField.active })
})

router.delete('/remove/:id',async (req,res) => {
    const foundField = await inputFields.findOne({
        where:{
            id: req.params.id
        }
    })
    if(!foundField)
        return res.status(404).json({message: 'Field Not Found!'})
    try{
        foundField.destroy();
        res.json({ status: 200, message: `Field Deleted!`})
        //res.r('/admin/inputField')
    } 
    catch(err){
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

router.get('/inputgroup', async (req, res) => {
    try{
        const inputField = await inputFields.findAll()
    res.render('admin/inputGroup', { User: req.user , inputField })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/')
    }
})

module.exports = router

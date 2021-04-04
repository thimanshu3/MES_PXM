const express = require('express')
const async = require('async')
const { ActivityLog, productTable } = require('../../models')

const { MySql } = require('../../db')
const { Router } = require('express')
const router = express.Router()


router.get('/', async (req, res) => {
    
    const [fields] = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr, inputTypes.inputType from inputFields INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')

    const vendor = await productTable.findAll()
    res.render('admin/importAssistant', { User: req.user, fields, vendor  })
})



module.exports = router
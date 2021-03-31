const express = require('express')
const async = require('async')

const { Redis } = require('../../db')
const { User } = require('../../models')
const { MySql } = require('../../db')
const router = express.Router()

router.get('/', async (req, res) => {
    const [fields] = await MySql.query('select inputFields.id as id , inputFields.active as active , inputFields.label as label , inputFields.description as description, inputFields.associatedList as lr, inputTypes.inputType from inputFields INNER join inputTypes on inputTypes.id = inputFields.typeOfField;')
    res.render('admin/importAssistant', { User: req.user, fields })
})

module.exports = router
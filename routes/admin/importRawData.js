const express = require('express')
const async = require('async')

const { Redis } = require('../../db')
const {  User  } = require('../../models')

const router = express.Router()
//Importing Raw Data
router.get('/', async (req, res) => {
        res.render('admin/importrawdata', { User: req.user })
    })

module.exports = router
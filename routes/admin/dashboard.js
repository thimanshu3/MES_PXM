const express = require('express')
const async = require('async')
const { promisify } = require('util')

const { Redis } = require('../../db')
const {  User  } = require('../../models')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/', async (req, res) => {
   
        res.render('admin/dashboard', { User: req.user })
    }
)

module.exports = router
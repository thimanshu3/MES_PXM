const { Router } = require('express')

// const { } = require('../../db')
// const { } = require('../../models')

const router = Router()

// Setup filters
router.get('/', async (req, res) => {
    res.send(200)
})

// View reports
router.post('/', async (req, res) => {
    res.send(200)
})

module.exports = router
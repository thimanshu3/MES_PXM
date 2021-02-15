const express = require('express')
const { promisify } = require('util')
const fetch = require('node-fetch')

const { Redis } = require('../../db')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

router.get('/:id', async (req, res) => {
    const content = await redisGet(`courseContent${req.params.id}`)
    if (content)
        return res.json({ data: content })
    try {
        const result = await fetch(`${process.env.PUPPETEER_URL}?url=https://ilor.itrackglobal.com/ilor/objects/${req.params.id}/datastreams/index/content`)
        const json = await result.json()
        if (json.status === 200) {
            const content = json.data
            res.json({ data: content })
            Redis.setex(`courseContent${req.params.id}`, 21600, content)
        } else
            res.status(500).json({ status: 500, message: json.message || 'Something Went Wrong!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ message: err.toString() })
    }
})

module.exports = router
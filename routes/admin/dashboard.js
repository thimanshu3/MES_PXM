const express = require('express')
const async = require('async')
const { promisify } = require('util')
const fetch = require('node-fetch')
const { formatDateMoment } = require('../../util')

const { Redis } = require('../../db')
const {  User  } = require('../../models')

const redisGet = promisify(Redis.get).bind(Redis)

const router = express.Router()

// middleware that keeps track of user access
let userAccessMap = new Map();

router.use((req, res, next) => {
    let id = req.user.id;
    let lastAccess = Date.now();
    userAccessMap.set(id, lastAccess);
    next();
});

const cleanupFrequency = 30 * 60 * 1000;
const cleanupTarget = 24 * 60 * 60 * 1000;
setInterval(() => {
    let now = Date.now();
    for (let [id, lastAccess] of userAccessMap.entries()) {
        if (now - lastAccess > cleanupTarget) {
            userAccessMap.delete(id);
        }
    }
}, cleanupFrequency);
//Logs of active users
router.get('/', async (req, res) => {
    try {
        const data = Array.from(userAccessMap)
        const finalArr =[]
       await Promise.all(
            data.map(async d => { finalArr.push({ user: await User.findOne({ where: { id: d[0] } }), time: d[1] }) }))
        res.render('admin/dashboard', { User: req.user , finalArr , formatDateMoment })

    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ message: err.toString() })
    }
   
    }
)

module.exports = router
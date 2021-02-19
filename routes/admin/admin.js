const express = require('express')

const router = express.Router()

router.get('/', (req, res) => res.redirect('/admin/dashboard'))

router.use('/dashboard', require('./dashboard'))
// router.use('/users', require('./users'))
router.use('/addUser', require('./addUser'))

router.use('/attributeset', require('./AttributeSet'))

router.use('/users', require('./users'))


module.exports = router
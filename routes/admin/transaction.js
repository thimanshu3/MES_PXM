const { Router } = require('express')
const { Transaction } = require('../../models')

const router = Router()

router.get('/', async (req, res) => {
    const transactions = await Transaction.findAll({
        order: [
            ['createdAt', 'DESC']
        ]
    })
    res.render('admin/transactions', { User: req.user, transactions })
})

module.exports = router
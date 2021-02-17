const express = require('express')
const { Op } = require('sequelize')

const { MySql } = require('../../db')
const { User, AttributeSet } = require('../../models')

const router = express.Router()

router.post('/create', async (req, res) => {
    const { name } = req.body
    if (!name) {
        req.flash('error', 'name is required!')
        res.redirect('/admin/AttributeSets')
        return
    }
    try {
        const attribute = await AttributeSet.create({ name })
        req.flash('success', `${attribute.name} Added Successfully!`)
        res.redirect('/admin/AttributeSets')
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            req.flash('error', `${err.errors[0].message} '${err.errors[0].value}' already exists!`)
        else
            req.flash('error', err.toString() || 'Something Went Wrong!')
        res.redirect('/admin/AttributeSets')
    }
})

module.exports = router

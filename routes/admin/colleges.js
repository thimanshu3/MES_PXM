const express = require('express')
const async = require('async')

const { MySql } = require('../../db')
const { College, User, Specialization } = require('../../models')
const { updateCollegeSchema, updateSpocSchema } = require('../../validation')

const router = express.Router()

router.get('/', async (req, res) => {
    const [result] = await MySql.query('SELECT colleges.id as id, colleges.name as name, colleges.logoSource as logoSource, users.firstName as firstName, users.lastName as lastName, users.email as email, users.contactNumber as contactNumber FROM colleges INNER JOIN users ON users.college = colleges.id AND users.role = 1')
    res.render('admin/colleges', { User: req.user, Colleges: result })
})

router.get('/:id', async (req, res) => {
    const foundCollege = await College.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundCollege) {
        req.flash('error', 'College Not Found!')
        res.redirect('/admin/colleges')
        return
    }

    const [users, Specializations, [assignedCourses]] = await async.parallel([
        async () => await User.findAll({
            where: {
                college: req.params.id
            }
        }),
        async () => await Specialization.findAll(),
        async () => await MySql.query('SELECT c.id as id, c.name as name, c.description as description, c.specializationId as specializationId, c.iceCourseCode as iceCourseCode, c.ilorCode as ilorCode, c.imageSource as imageSource FROM courseAssignedToColleges ca INNER JOIN courses c ON ca.courseId = c.id WHERE ca.collegeId = ?', { replacements: [req.params.id] })
    ])

    const specializations = {}
    Specializations.forEach(s => specializations[s.id] = s.name)

    const spocs = []
    const students = []
    const faculties = []
    let active = false

    users.forEach(user => {
        if (user.active === true)
            active = true
        switch (user.role) {
            case 1:
                spocs.push(user)
                break
            case 2:
                faculties.push(user)
                break
            case 3:
                students.push(user)
                break
        }
    })

    if (spocs.length !== 1) {
        console.log(`College Error '${req.params.id}'`)
        req.flash('error', 'Something Went Wrong!')
        res.redirect('/admin/colleges')
        return
    }

    assignedCourses.forEach(c => c.specializationName = specializations[c.specializationId])

    res.render('admin/college', { User: req.user, College: foundCollege, spoc: spocs[0], faculties, students, specializations, assignedCourses, active })
})

router.put('/:id', (req, res) => {
    updateCollegeSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            const college = await College.findOne({
                where: {
                    id: req.params.id
                }
            })

            if (!college)
                return res.status(404).json({ message: 'College Not Found!' })

            college.name = validatedObj.name
            college.address = validatedObj.address
            college.website = validatedObj.website
            college.directorName = validatedObj.directorName
            college.directorEmail = validatedObj.directorEmail
            college.directorContactNumber = validatedObj.directorContactNumber

            try {
                await college.save()
                res.json({ status: 200, message: 'College Updated Successfully' })
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (err.name === 'SequelizeUniqueConstraintError')
                    return res.json({ status: 400, message: 'Validation Error', error: `${err.errors[0].message} '${err.errors[0].value}' already exists!` })
                else
                    return res.json({ status: 500, message: err.toString() || 'Something Went Wrong!' })
            }
        })
        .catch(err => {
            res.status(400).json({ status: 400, message: 'Validation Error', error: `${err.toString()}` })
        })
})

router.patch('/:id', (req, res) => {
    updateSpocSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            const spoc = await User.findOne({
                where: {
                    id: req.params.id,
                    role: 1
                }
            })

            if (!spoc)
                return res.status(404).json({ message: 'SPoC Not Found!' })

            spoc.firstName = validatedObj.firstName
            spoc.lastName = validatedObj.lastName
            spoc.email = validatedObj.email
            spoc.contactNumber = validatedObj.contactNumber

            if (validatedObj.githubUrl)
                spoc.githubUrl = validatedObj.githubUrl

            if (!validatedObj.linkedinUrl)
                spoc.linkedinUrl = validatedObj.linkedinUrl

            try {
                await spoc.save()
                res.json({ status: 200, message: 'SPoC Updated Successfully!' })
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                if (err.name === 'SequelizeUniqueConstraintError')
                    return res.json({ status: 400, message: 'Validation Error', error: `${err.errors[0].message} '${err.errors[0].value}' already exists!` })
                else
                    return res.json({ status: 500, message: err.toString() || 'Something Went Wrong!' })
            }
        })
        .catch(err => {
            res.status(400).json({ status: 400, message: 'Validation Error', error: `${err.toString()}` })
        })
})

router.delete('/:id', async (req, res) => {
    try {
        await User.update({
            active: req.query.active == 'true' ? true : false
        }, {
            where: {
                college: req.params.id
            }
        })
        res.json({ status: 200, message: `All College Users ${req.query.active == 'true' ? 'Activated' : 'Deactivated'}!` })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        res.status(500).json({ status: 500, message: err.toString() || 'Something Went Wrong!' })
    }
})

module.exports = router
const express = require('express')
const bcrypt = require('bcryptjs')

const { User } = require('../../models')
const { sendMail, random, genNewUserWelcomeTemplate } = require('../../util')

const router = express.Router()

router.patch('/:id', async (req, res) => {    
    const user = await User.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!user)
        return res.status(404).json({ message: 'User Not Found!' })

    const { email, contactNumber, firstName, lastName, gender, role } = req.body

    if (!email)
        return res.status(400).json({ message: 'email is required!' })
    if (!contactNumber)
        return res.status(400).json({ message: 'contactNumber is required!' })
    if (!firstName)
        return res.status(400).json({ message: 'firstName is required!' })
    if (!lastName)
        return res.status(400).json({ message: 'lastName is required!' })
    if (!gender)
        return res.status(400).json({ message: 'gender is required!' })

    if (email !== user.email) {
        const newPassword = process.env.NODE_ENV === 'production' ? random(8).toUpperCase() : 'password'
        const newPasswordHashed = await bcrypt.hash(newPassword, 10)
        if (process.env.NODE_ENV === 'production')
            sendMail(email, 'Your New Credentials for DME@PXM', '', genNewUserWelcomeTemplate(email, newPassword))
        user.password = newPasswordHashed
    }

    user.email = email
    user.contactNumber = contactNumber
    user.firstName = firstName
    user.lastName = lastName
    user.gender = gender
    if (user.role == 0)
        user.role = role

    try {
        await user.save()
        res.json({ status: 200, message: 'User Updated Successfully!' })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        if (err.name === 'SequelizeUniqueConstraintError')
            return res.status(400).json({ message: `${err.errors[0].message} '${err.errors[0].value}' already exists!` })
        return res.status(500).json({ message: err.toString() || 'Somthing Went Wrong!' })
    }
})

router.delete('/:id', async (req, res) => {
    const foundUser = await User.findOne({
        where: {
            id: req.params.id
        }
    })

    if (!foundUser)
        return res.status(404).json({ message: 'User Not Found!' })

    if (foundUser.role === 0)
        return res.status(400).json({ message: 'Cannot Deactive Admin' })

    foundUser.active = !foundUser.active
    await foundUser.save()

    res.json({ status: 200, message: `User ${foundUser.active ? 'Activated' : 'Deactivated'} Successfully!`, active: foundUser.active })
})

module.exports = router
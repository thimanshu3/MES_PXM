const express = require('express')
const passport = require('passport')
const bcrypt = require('bcryptjs')

const { checkAuthenticated, checkNotAuthenticated } = require('../../middlewares')
const { User, ForgotPassword } = require('../../models')
const { changePasswordSchema, resetPasswordSchema } = require('../../validation')
const { sendMail, random } = require('../../util')

const router = express.Router()

router.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    successFlash: true,
    failureRedirect: '/login',
    failureFlash: true
}))

router.get('/login/google', checkNotAuthenticated, passport.authenticate('google', { scope: ['email', 'profile'] }))

router.get('/login/google/callback', checkNotAuthenticated, passport.authenticate('google', {
    successRedirect: '/',
    successFlash: true,
    failureRedirect: '/login',
    failureFlash: true,
}))

router.delete('/logout', checkAuthenticated, (req, res) => {
    req.logOut()
    res.redirect('/login')
})

router.get('/changePassword', checkAuthenticated, (req, res) => res.render('user/changePassword', { User: req.user }))

router.post('/changePassword', checkAuthenticated, async (req, res) => {
    try {
        const validatedObj = await changePasswordSchema.validateAsync(req.body)

        const { currentPassword, newPassword, confirmPassword } = validatedObj

        if (newPassword !== confirmPassword) {
            req.flash('error', 'New & Confirm Passwords do not match!')
            res.redirect('/user/changePassword')
            return
        }
        if (currentPassword === newPassword) {
            req.flash('error', 'Current & New Passwords cannot be same!')
            res.redirect('/user/changePassword')
            return
        }
        const foundUser = await User.findOne({
            where: {
                id: req.user.id
            }
        })

        if (!foundUser) {
            console.log('\x1b[31m%s\x1b[0m', `User not exists but still logged in - id: ${req.user.id}, email: ${req.user.email}`)
            req.flash('error', 'Something Went Wrong!')
            req.logOut()
            res.redirect('/login')
            return
        }

        if (await bcrypt.compare(currentPassword, foundUser.password)) {
            foundUser.password = await bcrypt.hash(newPassword, 10)
            await foundUser.save()
            req.flash('success', 'Password Changed Successfully!')
            res.redirect('/')
        } else {
            req.flash('error', 'Invalid Current Password!')
            res.redirect('/user/changePassword')
        }
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/user/changePassword')
    }
})

router.get('/forgotPassword', checkNotAuthenticated, (req, res) => res.render('user/forgotPassword'))

router.post('/forgotPassword', checkNotAuthenticated, async (req, res) => {
    if (!req.body.email) {
        req.flash('error', 'email is required!')
        res.redirect('/user/forgotPassword')
        return
    }

    try {
        const foundUser = await User.findOne({
            where: {
                email: req.body.email,
                active: true
            }
        })

        if (!foundUser) {
            req.flash('error', 'User Not Found!')
            res.redirect('/user/forgotPassword')
            return
        }

        const code = random(7)

        await ForgotPassword.upsert({
            user: foundUser.id,
            code
        })

        setTimeout(async () => {
            await ForgotPassword.destroy({
                where: {
                    user: foundUser.id
                }
            })
        }, 300000)

        sendMail(foundUser.email, 'Forgot Password Verification Code for IBM LMS', '', `
            <!DOCTYPE html>
            <html>

            <head>

                <meta charset="utf-8">
                <meta http-equiv="x-ua-compatible" content="ie=edge">
                <title>Password Reset</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style type="text/css">
                    @media screen {
                        @font-face {
                            font-family: 'Source Sans Pro';
                            font-style: normal;
                            font-weight: 400;
                            src: local('Source Sans Pro Regular'), local('SourceSansPro-Regular'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/ODelI1aHBYDBqgeIAH2zlBM0YzuT7MdOe03otPbuUS0.woff) format('woff');
                        }

                        @font-face {
                            font-family: 'Source Sans Pro';
                            font-style: normal;
                            font-weight: 700;
                            src: local('Source Sans Pro Bold'), local('SourceSansPro-Bold'), url(https://fonts.gstatic.com/s/sourcesanspro/v10/toadOcfmlt9b38dHJxOBGFkQc6VGVFSmCnC_l7QZG60.woff) format('woff');
                        }
                    }

                    body,
                    table,
                    td,
                    a {
                        -ms-text-size-adjust: 100%;
                        -webkit-text-size-adjust: 100%;
                    }

                    table,
                    td {
                        mso-table-rspace: 0pt;
                        mso-table-lspace: 0pt;
                    }

                    img {
                        -ms-interpolation-mode: bicubic;
                    }

                    a[x-apple-data-detectors] {
                        font-family: inherit !important;
                        font-size: inherit !important;
                        font-weight: inherit !important;
                        line-height: inherit !important;
                        color: inherit !important;
                        text-decoration: none !important;
                    }

                    div[style*="margin: 16px 0;"] {
                        margin: 0 !important;
                    }

                    body {
                        width: 100% !important;
                        height: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }

                    table {
                        border-collapse: collapse !important;
                    }

                    a {
                        color: black;
                    }

                    img {
                        height: auto;
                        line-height: 100%;
                        text-decoration: none;
                        border: 0;
                        outline: none;
                    }
                </style>
            </head>

            <body style="background-color: #e9ecef;">
                <div class="preheader"
                    style="display: none; max-width: 0; max-height: 0; overflow: hidden; font-size: 1px; line-height: 1px; color: #fff; opacity: 0;">
                    A preheader is the short summary text that follows the subject line when an email is viewed in the inbox.
                </div>
                <table border="0" cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td align="center" bgcolor="#e9ecef">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td align="center" valign="top" style="padding: 36px 24px;">
                                        <a href="https://sendgrid.com" target="_blank" rel="noopener noreferrer"
                                            style="display: inline-block;">
                                            <img src="https://miro.medium.com/max/694/1*WD6D6Ok1-Uv6QQWaAwR2bw.png" alt="Logo"
                                                border="0" width="48"
                                                style="display: block; width: 48px; max-width: 48px; min-width: 48px;">
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#e9ecef">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td bgcolor="#ffffff" align="left">
                                        <img src="https://www.marcobehler.com/images/guides/undraw_security_o890-ef012601.png"
                                            alt="Welcome" width="600" style="display: block; width: 100%; max-width: 100%;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#e9ecef">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td bgcolor="#ffffff" align="left"
                                        style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px;">
                                        <h1 style="margin: 0 0 12px; font-size: 32px; font-weight: 400; line-height: 48px;">Hello,
                                            ${foundUser.firstName}!</h1>
                                        <strong>
                                            <p style="margin: 0;">We recived a request to reset your password</p>
                                        </strong>
                                        <p>Use the code below within 5 minutes to set up new password for your account.
                                            if you did not request to reset your password, ignore this email and the link will
                                            expire on its own.
                                        </p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" bgcolor="#ffffff">
                                        <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                            <tr>
                                                <td align="center" bgcolor="#ffffff" style="padding: 12px;">
                                                    <table border="0" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td align="center" bgcolor="#1a82e2" style="border-radius: 6px;">
                                                                <a rel="noopener noreferrer"
                                                                    style="display: inline-block; padding: 16px 36px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 6px;">${code}
                                                                </a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="left" bgcolor="#ffffff"
                                        style="padding: 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 16px; line-height: 24px; border-bottom: 3px solid #d4dadf">
                                        <p style="margin: 0;"><strong> Team <span style="color: #0000FF"> Amigos </span></strong>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" bgcolor="#e9ecef" style="padding: 24px;">
                            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px;">
                                <tr>
                                    <td align="center" bgcolor="#e9ecef"
                                        style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                                        <p style="margin: 0;">You received this email because we received a request for
                                            <b> password reset </b> for your account. If you didn't request <b> password reset </b>
                                            you
                                            can safely
                                            delete this email.</p>
                                    </td>
                                </tr>
                                <tr>
                                    <td align="center" bgcolor="#e9ecef"
                                        style="padding: 12px 24px; font-family: 'Source Sans Pro', Helvetica, Arial, sans-serif; font-size: 14px; line-height: 20px; color: #666;">
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>

            </html>
        `)

        req.flash('success', 'Code sent to your email!')
        res.render('user/resetPassword', { code })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
        req.flash('error', err.toString())
        res.redirect('/user/forgotPassword')
    }
})

router.post('/resetPassword', checkNotAuthenticated, (req, res) => {
    resetPasswordSchema
        .validateAsync(req.body)
        .then(async validatedObj => {
            try {
                const { code, newPassword, confirmPassword } = validatedObj

                if (newPassword !== confirmPassword)
                    return res.status(400).json({ status: 400, message: 'New & Confirm Passwords do not match!' })

                const forgotPassword = await ForgotPassword.findOne({
                    where: {
                        code
                    }
                })

                if (!forgotPassword)
                    return res.status(400).json({ status: 400, message: 'Invalid Verification Code!' })

                const foundUser = await User.findOne({
                    where: {
                        id: forgotPassword.user
                    }
                })

                if (!foundUser)
                    return res.status(400).json({ status: 400, message: 'User Not Found!' })

                foundUser.password = await bcrypt.hash(newPassword, 10)

                await forgotPassword.destroy()
                await foundUser.save()

                res.json({ status: 200 })
            } catch (err) {
                console.error('\x1b[31m%s\x1b[0m', err)
                res.status(500).json({ status: 500, message: err.toString() })
            }
        })
        .catch(err => res.status(400).json({ status: 400, message: err.toString() }))
})

router.use('/profile', checkAuthenticated, require('./profile'))

module.exports = router
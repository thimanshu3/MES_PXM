const nodemailer = require('nodemailer')

/**
 * @param {string} email - Email address of the reciever.
 * @param {string} subject - The subject of email.
 * @param {string} body - The body of email.
 *
 * Sends an email to a particular Email Address with given Subject and Body.
 */
module.exports = (email, subject, body, html = '', attachments) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.NODEMAILER_EMAIL,
            pass: process.env.NODEMAILER_PASSWORD
        }
    })
    const mailOptions = {
        from: `LMS <${process.env.NODEMAILER_EMAIL}>`,
        to: email,
        subject,
        text: body,
        html,
        attachments
    }
    transporter.sendMail(mailOptions, (err, info) => {
        if (err)
            console.error('\x1b[31m%s\x1b[0m', err)
        console.log(info)
    })
}
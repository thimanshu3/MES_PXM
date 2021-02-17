const LocalStrategy = require('passport-local').Strategy
const GoogleStrategy = require('passport-google-oauth20').Strategy
const bcrypt = require('bcryptjs')
const { promisify } = require('util')

const clientID = process.env.GOOGLE_0AUTH_CLIENT_ID
const clientSecret = process.env.GOOGLE_0AUTH_CLIENT_SECRET

const { Redis } = require('../db')
const { User, LoginReport, FacultyHODAssignment } = require('../models')

const redisGet = promisify(Redis.get).bind(Redis)

const RoleNames = {
    0: 'Admin',
    1: 'Product Manager',
    2: 'Power User',
}

const getUserMessage = (name, role) => {
    let message = ''
    switch (role) {
        case 0:
            message = 'Admin'
            break
        case 1:
            message = 'Product Manager'
            break
        case 2:
            message = 'Power User'
            break
        default:
            message = ''
            break
    }
    return `Welcome ${message} ${name}!`
}

const addLoginDetails = async userId => {
    try {
        await LoginReport.create({
            user: userId
        })
    } catch (err) {
        console.error('\x1b[31m%s\x1b[0m', err)
    }
}

const transformUser = async user => {
    const { id, email, role, profileImageSource, firstName, lastName, college } = user
    const transformedUser = {
        id,
        email,
        role,
        roleName: RoleNames[role],
        profileImageSource,
        firstName,
        lastName
    }
    if (college)
        transformedUser.college = college
    if (college && transformedUser.role === 2) {
        transformedUser.isHOD = false
        let hod = await redisGet(`hod-${id}-${college}`)
        if (hod) {
            hod = JSON.parse(hod)
            transformedUser.isHOD = hod.isHOD
            transformedUser.hodSpecializationId = hod.specializationId
        }
        else {
            const hod = await FacultyHODAssignment.findOne({
                where: {
                    userId: id,
                    collegeId: college
                }
            })
            if (hod) {
                Redis.setex(`hod-${id}-${college}`, 90, JSON.stringify({ isHOD: true, specializationId: hod.specializationId }))
                transformedUser.isHOD = true
                transformedUser.hodSpecializationId = hod.specializationId
            } else {
                Redis.setex(`hod-${id}-${college}`, 90, JSON.stringify({ isHOD: false }))
                transformedUser.isHOD = false
            }
        }
    }
    if (transformedUser.isHOD) transformedUser.roleName = 'HOD'
    return transformedUser
}

module.exports = passport => {
    const authenticateLocalUser = async (email, password, done) => {
        if (!email || !password)
            return done(null, false, { message: 'Email and Password is required!' })

        let foundUser

        try {
            foundUser = await User.findOne({
                where: {
                    email
                }
            })
        } catch (err) {
            console.error('\x1b[31m%s\x1b[0m', err)
            return done(null, false, { message: 'Something Went Wrong!' })
        }

        if (!foundUser)
            return done(null, false, { message: process.env.NODE_ENV === 'production' ? 'Invalid Email or Password!' : 'User Not Found!' })

        if (!foundUser.active)
            return done(null, false, 'Your Account is Deactivated!')

        try {
            if (await bcrypt.compare(password, foundUser.password)) {
                addLoginDetails(foundUser.id)
                return done(
                    null,
                    await transformUser(foundUser),
                    {
                        message: getUserMessage(foundUser.firstName, foundUser.role)
                    })
            }
            else
                return done(null, false, { message: process.env.NODE_ENV === 'production' ? 'Invalid Email or Password!' : 'Invalid Password!' })
        } catch (err) {
            console.error('\x1b[31m%s\x1b[0m', err)
            return done(null, false, { message: 'Something Went Wrong!' })
        }
    }
    const authenticateGoogleUser = async (accessToken, refreshToken, profile, done) => {
        try {
            const isEmailVerified = profile._json.email_verified
            const email = profile._json.email
            if (!email)
                return done(null, false, { message: 'No Email Associated to your Google Account!' })
            if (!isEmailVerified)
                return done(null, false, { message: 'Your Google Email is not Verified!' })
            const foundUser = await User.findOne({
                where: {
                    email
                }
            })

            if (!foundUser)
                return done(null, false, { message: 'User Not Found!' })

            if (!foundUser.active)
                return done(null, false, { message: 'Your Account is Deactivated!' })

            addLoginDetails(foundUser.id)
            return done(null, await transformUser(foundUser), { message: getUserMessage(foundUser.firstName, foundUser.role) })
        } catch (err) {
            console.error('\x1b[31m%s\x1b[0m', err)
            return done(null, false, { message: 'Something Went Wrong!' })
        }
    }
    passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, authenticateLocalUser))
    passport.use(new GoogleStrategy({
        clientID,
        clientSecret,
        callbackURL: '/user/login/google/callback'
    }, authenticateGoogleUser))
    passport.serializeUser((user, done) => done(null, user.id))
    passport.deserializeUser(async (id, done) => {
        try {
            let foundUser = await redisGet(`auth-user-${id}`)
            if (foundUser) foundUser = JSON.parse(foundUser)
            else {
                foundUser = await User.findOne({
                    where: {
                        id
                    }
                })

                if (!foundUser)
                    throw new Error('Your Account Does Not Exists!')
                if (!foundUser.active)
                    throw new Error('Your Account has been Deactivated!')

                Redis.setex(`auth-user-${foundUser.id}`, 90, JSON.stringify(foundUser))
            }

            done(null, await transformUser(foundUser))
        } catch (err) {
            console.error('\x1b[31m%s\x1b[0m', err)
            done(null, false, { message: err.toString() || 'Something Went Wrong!' })
        }
    })
}
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const methodOverride = require('method-override')
const session = require('express-session')
const redisSessionStore = require('connect-redis')(session)
const flash = require('express-flash')
const passport = require('passport')
const helmet = require('helmet')

const { Redis } = require('./db')
const initializePassport = require('./passport/initializePassport')

const port = process.env.PORT
const sessionSecret = process.env.SESSION_SECRET
const NotFoundPage = path.join(__dirname, 'public/404.html')
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })


const app = express()
initializePassport(passport)

app.use(helmet.dnsPrefetchControl())
app.use(helmet.frameguard())
app.use(helmet.hidePoweredBy())
app.use(helmet.hsts())
app.use(helmet.ieNoOpen())
app.use(helmet.noSniff())
app.use(helmet.xssFilter())
app.set('view engine', 'ejs')
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'))
if (process.env.NODE_ENV === 'production')
    app.use(morgan('combined', { stream: accessLogStream }))
app.use('/', express.static('public'))
app.use('/uploads', express.static('uploads'))
app.use(express.json())
app.use(express.urlencoded({
    extended: false
}))
app.use(methodOverride('_method'))
app.use(session({
    name: 'sessionId',
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        // secure: process.env.NODE_ENV === 'production' ? true : false,
        maxAge: 24 * 60 * 60 * 1000
    },
    store: new redisSessionStore({ client: Redis })
}))
app.use(flash())
app.use(passport.initialize())
app.use(passport.session())
app.use('/', require('./routes/routes'))
app.use('*', (req, res) => res.status(404).sendFile(NotFoundPage))

app.listen(port, console.log(
    '\x1b[36m%s\x1b[0m',
    `${process.env.NODE_ENV === 'production' ? 'Production' : 'Development'} Server started on port ${port}...`)
)



if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

const path = require('path')
const express = require('express')
const session = require('express-session')
const passport = require('./config/passport')
const handlebars = require('express-handlebars')
const handlebarsHelpers = require('./helpers/handlebars-helpers')
const flash = require('connect-flash')
const methodOverride = require('method-override')
const { pages, apis } = require('./routes')
const { getUser } = require('./helpers/auth-helpers')

require('./models')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = process.env.MY_SESSION_SECRET

app.engine('hbs', handlebars({ extname: '.hbs', helpers: handlebarsHelpers }))
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
)
app.use(passport.initialize()) // 初始化 Passport
app.use(passport.session()) // 啟動 session 功能

app.use(flash())
app.use(methodOverride('_method'))
app.use('/upload', express.static(path.join(__dirname, 'upload')))
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages')
  res.locals.error_messages = req.flash('error_messages')
  res.locals.user = getUser(req)
  next()
})

app.use('/api', apis)
app.use(pages)

app.listen(port, () => {
  console.info(`App is running on http://localhost:${port}`)
})

module.exports = app

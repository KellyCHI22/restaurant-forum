const express = require('express')
const session = require('express-session')
const passport = require('./config/passport')
const handlebars = require('express-handlebars')
const flash = require('connect-flash')
const routes = require('./routes')

const app = express()
const port = process.env.PORT || 3000
const SESSION_SECRET = 'secret' // 新增這行

const db = require('./models')

app.engine('hbs', handlebars({ extname: '.hbs' }))
app.set('view engine', 'hbs')

app.use(express.urlencoded({ extended: true }))

app.use(
  session({ secret: SESSION_SECRET, resave: false, saveUninitialized: false })
)
app.use(passport.initialize()) // 初始化 Passport
app.use(passport.session()) // 啟動 session 功能

app.use(flash()) // 掛載套件
app.use((req, res, next) => {
  res.locals.success_messages = req.flash('success_messages') // 設定 success_msg 訊息
  res.locals.error_messages = req.flash('error_messages') // 設定 warning_msg 訊息
  next()
})

app.use(routes)

app.listen(port, () => {
  console.info(`App is running on http://localhost:${port}`)
})

module.exports = app

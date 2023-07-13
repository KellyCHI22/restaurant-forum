const express = require('express')
const flash = require('connect-flash')
const session = require('express-session')
const routes = require('./routes')
const handlebars = require('express-handlebars')

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

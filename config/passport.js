const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const db = require('../models')
const User = db.User
// set up Passport strategy
passport.use(
  new LocalStrategy(
    // customize user field
    {
      usernameField: 'email',
      passwordField: 'password',
      // 如果在第一組參數裡設定了 passReqToCallback: true，
      // 就可以把 callback 的第一個參數拿到 req 裡，
      // 這麼一來我們就可以呼叫 req.flash() 把想要客製化的訊息放進去。
      passReqToCallback: true
    },
    // authenticate user
    (req, email, password, cb) => {
      User.findOne({ where: { email } }).then(user => {
        // 從資料庫裡找 user, 若此 user email 不存在
        if (!user) {
          return cb(
            null,
            false, // 只要在第二位帶入 false 就代表登入不成功
            req.flash('error_messages', '帳號或密碼輸入錯誤！')
          )
        }
        // 若使用者存在，比對密碼
        bcrypt.compare(password, user.password).then(res => {
          // 若密碼錯誤
          if (!res) {
            return cb(
              null,
              false,
              req.flash('error_messages', '帳號或密碼輸入錯誤！')
            )
          }
          // 若密碼也通過驗證
          return cb(null, user)
        })
      })
    }
  )
)
// serialize and deserialize user
passport.serializeUser((user, cb) => {
  cb(null, user.id)
})
passport.deserializeUser((id, cb) => {
  User.findByPk(id).then(user => {
    user = user.toJSON()
    return cb(null, user)
  })
})
module.exports = passport

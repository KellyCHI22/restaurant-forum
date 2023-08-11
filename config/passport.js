const passport = require('passport')
const LocalStrategy = require('passport-local')
const bcrypt = require('bcryptjs')
const { User, Restaurant } = require('../models')

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
  User.findByPk(id, {
    // * 用 as 來標明我們想要引入的關係，對應到我們在 model 裡設定的名稱
    include: [
      { model: Restaurant, as: 'FavoritedRestaurants' },
      { model: Restaurant, as: 'VisitedRestaurants' },
      { model: User, as: 'Followers' },
      { model: User, as: 'Followings' }
    ]
  })
    .then(user => cb(null, user.toJSON()))
    .catch(err => cb(err))
})
module.exports = passport

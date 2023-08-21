const passport = require('passport')
const LocalStrategy = require('passport-local')
const passportJWT = require('passport-jwt')
const bcrypt = require('bcryptjs')
const { User, Restaurant } = require('../models')

const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

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
      User.scope('withPassword') // need to use 'withPassword' scope or the password wont be sent back
        .findOne({ where: { email } })
        .then(user => {
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

// setup passport-jwt
const jwtOptions = {
  // 設定去哪裡找 token，設定必須在 header 中設定 bearer token
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  // 使用密鑰來檢查 token 是否經過纂改
  secretOrKey: process.env.JWT_SECRET,
  passReqToCallback: true
}
// 根據 jwtOptions 裡的資訊，理論上可以成功解開 token，接下來就用解開後的資訊去進行下一步
passport.use(
  new JWTStrategy(jwtOptions, (req, jwtPayload, cb) => {
    // 使用解析出的 id 去資料庫中尋找 user
    User.findByPk(jwtPayload.id, {
      include: [
        { model: Restaurant, as: 'FavoritedRestaurants' },
        { model: Restaurant, as: 'VisitedRestaurants' },
        { model: User, as: 'Followers' },
        { model: User, as: 'Followings' }
      ]
    })
      .then(user => {
        req.user = user.toJSON()
        cb(null, user)
      })
      .catch(err => cb(err))
  })
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

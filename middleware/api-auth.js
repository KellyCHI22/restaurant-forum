const passport = require('../config/passport') // 引入 passport

// passport.authenticate() 是 passport-jwt 提供的方法
// 這邊把方法封裝成 authenticated來使用，當成 middleware 加入路由
// const authenticated = passport.authenticate('jwt', { session: false })
// 使用以下的寫法，才能針對 req, res 做處理
const authenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user) => {
    if (err || !user) { return res.status(401).json({ status: 'error', message: 'unauthorized' }) }

    next()
  })(req, res, next)
}

const authenticatedAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) return next()
  return res
    .status(403)
    .json({ status: 'error', message: 'permission denied' })
}

module.exports = {
  authenticated,
  authenticatedAdmin
}

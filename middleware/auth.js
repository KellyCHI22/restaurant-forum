const { ensureAuthenticated, getUser } = require('../helpers/auth-helpers')
const authenticated = (req, res, next) => {
  // * if (req.isAuthenticated) 判斷使用者是否有登入，若有，繼續往下走
  if (ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  // * if (req.isAuthenticated) 判斷使用者是否有登入
  if (ensureAuthenticated(req)) {
    // *
    if (getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}
module.exports = {
  authenticated,
  authenticatedAdmin
}

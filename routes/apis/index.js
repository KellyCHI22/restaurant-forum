const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const admin = require('./modules/admin')
const restaurantController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const { apiErrorHandler } = require('../../middleware/error-handler') // 新增這行

router.use('/admin', admin)
// 因為我們不用 cookie-based 驗證了，所以也不需要 Passport 幫我們建立 session，需要把這個功能關掉。
router.post(
  '/signin',
  passport.authenticate('local', { session: false }),
  userController.signIn
)

router.get('/restaurants', restaurantController.getRestaurants)
router.use('/', apiErrorHandler)

module.exports = router

const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const admin = require('./modules/admin')
const restaurantController = require('../../controllers/apis/restaurant-controller')
const userController = require('../../controllers/apis/user-controller')
const commentController = require('../../controllers/apis/comment-controller')
const {
  authenticated,
  authenticatedAdmin
} = require('../../middleware/api-auth')
const { apiErrorHandler } = require('../../middleware/error-handler') // 新增這行

// authenticated, authenticatedAdmin 都要，因為要先檢驗是否有 token，再檢驗是否為 admin
router.use('/admin', authenticated, authenticatedAdmin, admin)

router.get(
  '/restaurants/top',
  authenticated,
  restaurantController.getTopRestaurants
)
router.get(
  '/restaurants/latest',
  authenticated,
  restaurantController.getLatestRestaurants
)

router.get(
  '/restaurants/:id/comments',
  authenticated,
  commentController.getComments
)

router.post(
  '/restaurants/:id/comments',
  authenticated,
  commentController.postComment
)

router.delete(
  '/restaurants/:id/comments/:commentId',
  authenticated,
  authenticatedAdmin,
  commentController.deleteComment
)

router.get(
  '/restaurants/:id',
  authenticated,
  restaurantController.getRestaurant
)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)

router.post('/signup', userController.signUp) // 注意用 post
// 因為我們不用 cookie-based 驗證了，所以也不需要 Passport 幫我們建立 session，需要把這個功能關掉。
router.post(
  '/signin',
  passport.authenticate('local', { session: false }),
  userController.signIn
)
router.use('/', apiErrorHandler)

module.exports = router

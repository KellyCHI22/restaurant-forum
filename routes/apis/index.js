const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const upload = require('../../middleware/multer')
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

// * signup and signin
router.post('/users/signup', userController.signUp) // 注意用 post
// 因為我們不用 cookie-based 驗證了，所以也不需要 Passport 幫我們建立 session，需要把這個功能關掉。
router.post(
  '/users/signin',
  passport.authenticate('local', { session: false }),
  userController.signIn
)

// * get top users
router.get('/users/top', authenticated, userController.getTopUsers)

// * favorites
router.post('/users/:id/favorites', authenticated, userController.addFavorite)
router.delete(
  '/users/:id/favorites',
  authenticated,
  userController.deleteFavorite
)

// * visit histories
router.post(
  '/users/:id/visit-histories',
  authenticated,
  userController.addVisitHistory
)
router.delete(
  '/users/:id/visit-histories',
  authenticated,
  userController.deleteVisitHistory
)

// * followship
router.post(
  '/users/:id/followings/:userId',
  authenticated,
  userController.addFollowing
)
router.delete(
  '/users/:id/followings/:userId',
  authenticated,
  userController.deleteFollowing
)

// * get user info and update
router.get('/users/:id', authenticated, userController.getUser)
router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

// * get top or latest restaurants
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

// * get, add, delete comments
router.get(
  '/restaurants/comments',
  authenticated,
  commentController.getLatestComments
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

// * get restaurant info
router.get(
  '/restaurants/:id',
  authenticated,
  restaurantController.getRestaurant
)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)

router.use('/', apiErrorHandler)

module.exports = router

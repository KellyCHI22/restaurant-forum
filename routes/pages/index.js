const express = require('express')
const router = express.Router()
const passport = require('../../config/passport')
const admin = require('./modules/admin')
const userController = require('../../controllers/pages/user-controller')
const restaurantController = require('../../controllers/pages/restaurant-controller')
const commentController = require('../../controllers/pages/​​comment-controller')
const { authenticated, authenticatedAdmin } = require('../../middleware/auth')
const { generalErrorHandler } = require('../../middleware/error-handler')
const upload = require('../../middleware/multer')

router.use('/admin', authenticatedAdmin, admin)
router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp) // 注意用 post
router.get('/signin', userController.signInPage)
router.post(
  '/signin',
  passport.authenticate('local', {
    failureRedirect: '/signin',
    failureFlash: true
  }),
  userController.signIn
) // 注意是 post
router.get('/logout', userController.logout)

// * users
router.get('/users/top', authenticated, userController.getTopUsers)
router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

// * restaurants
router.get(
  '/restaurants/top',
  authenticated,
  restaurantController.getTopRestaurants
)
router.get('/restaurants/feeds', authenticated, restaurantController.getFeeds) // 新增這一行
router.get(
  '/restaurants/:id/dashboard',
  authenticated,
  restaurantController.getDashboard
)
router.get(
  '/restaurants/:id',
  authenticated,
  restaurantController.getRestaurant
)
router.get('/restaurants', authenticated, restaurantController.getRestaurants)

// * comments
router.delete(
  '/comments/:id',
  authenticatedAdmin,
  commentController.deleteComment
)
router.post('/comments', authenticated, commentController.postComment)

// * favorite
router.post(
  '/favorite/:restaurantId',
  authenticated,
  userController.addFavorite
)
router.delete(
  '/favorite/:restaurantId',
  authenticated,
  userController.deleteFavorite
)

// * visit history
router.post(
  '/visit-history/:restaurantId',
  authenticated,
  userController.addVisitHistory
)
router.delete(
  '/visit-history/:restaurantId',
  authenticated,
  userController.deleteVisitHistory
)

// * followship，追蹤的對象是「某個使用者」，因此這邊動態路由是取 :userId
router.post('/following/:userId', authenticated, userController.addFollowing)
router.delete(
  '/following/:userId',
  authenticated,
  userController.deleteFollowing
)

router.use('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler) // error handler 有特出處理方式，因此順序無關

module.exports = router

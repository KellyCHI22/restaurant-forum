const express = require('express')
const router = express.Router()
const passport = require('../config/passport')
const admin = require('./modules/admin')
const userController = require('../controllers/user-controller')
const restaurantController = require('../controllers/restaurant-controller')
const commentController = require('../controllers/​​comment-controller')
const { authenticated, authenticatedAdmin } = require('../middleware/auth')
const { generalErrorHandler } = require('../middleware/error-handler')
const upload = require('../middleware/multer')

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

router.delete(
  '/comments/:id',
  authenticatedAdmin,
  commentController.deleteComment
)
router.post('/comments', authenticated, commentController.postComment)

router.get('/users/:id/edit', authenticated, userController.editUser)
router.get('/users/:id', authenticated, userController.getUser)
router.put(
  '/users/:id',
  authenticated,
  upload.single('image'),
  userController.putUser
)

router.use('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler) // error handler 有特出處理方式，因此順序無關

module.exports = router

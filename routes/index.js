const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const restaurantController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')
const { generalErrorHandler } = require('../middleware/error-handler')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp) // 注意用 post

router.use('/admin', admin)
router.get('/restaurants', restaurantController.getRestaurants)

router.use('/', (req, res) => res.redirect('/restaurants'))
router.use('/', generalErrorHandler) // error handler 有特出處理方式，因此順序無關

module.exports = router

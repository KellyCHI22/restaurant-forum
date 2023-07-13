const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const restaurantController = require('../controllers/restaurant-controller')
const userController = require('../controllers/user-controller')

router.get('/signup', userController.signUpPage)
router.post('/signup', userController.signUp) // 注意用 post

router.use('/admin', admin)
router.get('/restaurants', restaurantController.getRestaurants)

router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router

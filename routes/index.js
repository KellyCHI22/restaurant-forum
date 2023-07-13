const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const restaurantController = require('../controllers/restaurant-controller')

router.use('/admin', admin)

router.get('/restaurants', restaurantController.getRestaurants)

router.use('/', (req, res) => res.redirect('/restaurants'))

module.exports = router

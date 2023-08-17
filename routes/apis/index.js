const express = require('express')
const router = express.Router()
const admin = require('./modules/admin')
const restaurantController = require('../../controllers/apis/restaurant-controller')
const { apiErrorHandler } = require('../../middleware/error-handler') // 新增這行

router.use('/admin', admin)
router.get('/restaurants', restaurantController.getRestaurants)
router.use('/', apiErrorHandler)

module.exports = router

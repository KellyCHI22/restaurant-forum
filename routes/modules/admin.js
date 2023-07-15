const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')

// * 特別留意路由擺放的順序，應從嚴格到寬鬆
router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant) // 需擺在 /create 後面
router.put('/restaurants/:id', adminController.putRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post('/restaurants', adminController.postRestaurant)
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router

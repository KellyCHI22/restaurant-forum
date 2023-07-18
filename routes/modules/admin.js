const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/admin-controller')
const upload = require('../../middleware/multer')

// * 特別留意路由擺放的順序，應從嚴格到寬鬆
router.get('/restaurants/create', adminController.createRestaurant)
router.get('/restaurants/:id/edit', adminController.editRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant) // 需擺在 /create 後面
router.put(
  '/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/restaurants', adminController.getRestaurants)
router.post(
  '/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)
router.use('/', (req, res) => res.redirect('/admin/restaurants'))

module.exports = router

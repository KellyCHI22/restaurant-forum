const express = require('express')
const router = express.Router()
const upload = require('../../../middleware/multer')
const adminController = require('../../../controllers/apis/admin-controller')
const categoryController = require('../../../controllers/apis/category-controller')

router.get('/restaurants/:id', adminController.getRestaurant)
router.put(
  '/restaurants/:id',
  upload.single('image'),
  adminController.putRestaurant
)
router.delete('/restaurants/:id', adminController.deleteRestaurant)
router.get('/categories/:id', categoryController.getCategory)
router.put('/categories/:id', categoryController.putCategory)
router.delete('/categories/:id', categoryController.deleteCategory)

router.patch('/users/:id', adminController.patchUser)

router.get('/restaurants', adminController.getRestaurants)
router.post(
  '/restaurants',
  upload.single('image'),
  adminController.postRestaurant
)
router.get('/users', adminController.getUsers)
router.get('/categories', categoryController.getCategories)
router.post('/categories', categoryController.postCategory)

module.exports = router

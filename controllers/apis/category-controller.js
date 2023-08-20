const categoryService = require('../../services/category-service')

const categoryController = {
  getCategories: (req, res, next) => {
    return categoryService.getCategories(req, (err, data) => {
      err ? next(err) : res.json({ status: 'success', data })
    })
  },
  postCategory: (req, res, next) => {
    return categoryService.postCategory(req, (err, data) => {
      err ? next(err) : res.json({ status: 'success', data })
    })
  },
  putCategory: (req, res, next) => {
    return categoryService.putCategory(req, (err, data) => {
      err ? next(err) : res.json({ status: 'success', data })
    })
  },
  deleteCategory: (req, res, next) => {
    return categoryService.deleteCategory(req, (err, data) => {
      err ? next(err) : res.json({ status: 'success', data })
    })
  }
}
module.exports = categoryController

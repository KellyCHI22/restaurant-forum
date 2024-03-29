const categoryService = require('../../services/category-service')

const categoryController = {
  getCategories: (req, res, next) => {
    return categoryService.getCategories(req, (err, data) => {
      err ? next(err) : res.render('admin/categories', data)
    })
  },
  postCategory: (req, res, next) => {
    return categoryService.postCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'Category was successfully created')
      res.redirect('/admin/categories')
    })
  },
  putCategory: (req, res, next) => {
    return categoryService.putCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'Category was successfully updated')
      res.redirect('/admin/categories')
    })
  },
  deleteCategory: (req, res, next) => {
    return categoryService.deleteCategory(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'Category was successfully deleted')
      res.redirect('/admin/categories')
    })
  }
}
module.exports = categoryController

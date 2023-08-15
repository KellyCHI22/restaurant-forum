const categoryService = require('../services/category-service')

const categoryController = {
  getCategories: (req, res, next) => {
    const categoryId = req.params.id
    return categoryService
      .getCategories(categoryId)
      .then(([categories, category]) => {
        res.render('admin/categories', {
          categories,
          category
        })
      })
      .catch(err => next(err))
  },
  postCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return categoryService
      .postCategory(name, next)
      .then(() => {
        req.flash('success_messages', 'Category was successfully created')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  putCategory: (req, res, next) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return categoryService
      .putCategory(req.params.id, name, next)
      .then(() => {
        req.flash('success_messages', 'Category was successfully updated')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  },
  deleteCategory: (req, res, next) => {
    return categoryService
      .deleteCategory(req.params.id)
      .then(() => {
        req.flash('success_messages', 'Category was successfully deleted')
        res.redirect('/admin/categories')
      })
      .catch(err => next(err))
  }
}
module.exports = categoryController

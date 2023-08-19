const { Category } = require('../models')

const categoryService = {
  getCategories: (req, cb) => {
    const categoryId = req.params.id
    return Promise.all([
      Category.findAll({ raw: true }),
      // 檢查 req.params.id 這個變數是否存在，若存在則額外取出該 category 資料
      categoryId ? Category.findByPk(categoryId, { raw: true }) : null
    ])
      .then(([categories, category]) => cb(null, { categories, category }))
      .catch(err => cb(err))
  },
  getCategory: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return cb(null, { category })
      })
      .catch(err => cb(err))
  },
  postCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.create({ name })
      .then(category => cb(null, { category }))
      .catch(err => cb(err))
  },
  putCategory: (req, cb) => {
    const { name } = req.body
    if (!name) throw new Error('Category name is required!')
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.update({ name })
      })
      .then(category => cb(null, { category }))
      .catch(err => cb(err))
  },
  deleteCategory: (req, cb) => {
    return Category.findByPk(req.params.id)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!")
        return category.destroy()
      })
      .then(category => cb(null, { category }))
      .catch(err => cb(err))
  }
}
module.exports = categoryService

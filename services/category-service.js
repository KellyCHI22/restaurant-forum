const { Category } = require('../models')

const categoryService = {
  getCategories: (categoryId, next) => {
    return Promise.all([
      Category.findAll({ raw: true }),
      // 檢查 req.params.id 這個變數是否存在，若存在則額外取出該 category 資料
      categoryId ? Category.findByPk(categoryId, { raw: true }) : null
    ]).catch(err => next(err))
  },
  postCategory: (name, next) => {
    return Category.create({ name }).catch(err => next(err))
  },
  putCategory: (categoryId, name, next) => {
    return Category.findByPk(categoryId)
      .then(category => {
        if (!category) throw new Error("Category doesn't exist!")
        return category.update({ name })
      })
      .catch(err => next(err))
  },
  deleteCategory: (categoryId, next) => {
    return Category.findByPk(categoryId)
      .then(category => {
        if (!category) throw new Error("Category didn't exist!")
        return category.destroy()
      })
      .catch(err => next(err))
  }
}
module.exports = categoryService

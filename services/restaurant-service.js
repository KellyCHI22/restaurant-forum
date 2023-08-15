const { Restaurant, Category, Comment, User } = require('../models')

const restaurantService = {
  getRestaurants: (categoryId, limit, offset, next) => {
    return Promise.all([
      // 用 findAndCountAll 方法，可以取得 items.count 得知一共有幾筆資料
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          // 新增查詢條件
          ...(categoryId ? { categoryId } : {}) // 檢查 categoryId 是否為空值
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ]).catch(err => next(err))
  },
  getRestaurant: (restaurantId, next) => {
    return Restaurant.findByPk(restaurantId, {
      nest: true,
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'VisitedUsers' }
      ],
      // ! need to define the order at the top level and indicate the model
      order: [[{ model: Comment }, 'createdAt', 'DESC']]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        restaurant.increment('view_counts')
        return restaurant
      })
      .catch(err => next(err))
  },
  getDashboard: (restaurantId, next) => {
    return Restaurant.findByPk(restaurantId, {
      include: [Category, Comment]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant
      })
      .catch(err => next(err))
  },
  getFeeds: (limit, next) => {
    return Promise.all([
      Restaurant.findAll({
        // 取最新的 10 筆餐廳資料
        limit: limit,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        // 取最新的 10 筆留言
        limit: limit,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ]).catch(err => next(err))
  },
  // ? 不知道怎麼用 sequelize 去執行 sort
  getTopRestaurants: (limit, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }],
      limit: limit
    })
      .then(restaurants => {
        const result = restaurants
          .map(r => ({
            ...r.toJSON(),
            favoritedUsersCount: r.FavoritedUsers.length
          }))
          .sort((a, b) => b.favoritedUsersCount - a.favoritedUsersCount)
        return result
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantService

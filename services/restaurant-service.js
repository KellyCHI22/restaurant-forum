const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantService = {
  // * 使用 callback function 將 data 和 error 做後續處理，這邊就不需要 next 了
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    Promise.all([
      Restaurant.findAndCountAll({
        include: Category,
        where: {
          ...(categoryId ? { categoryId } : {})
        },
        limit,
        offset,
        nest: true,
        raw: true
      }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user?.FavoritedRestaurants
          ? req.user.FavoritedRestaurants.map(fr => fr.id)
          : []
        const likedRestaurantsId = req.user?.LikedRestaurants
          ? req.user.LikedRestaurants.map(lr => lr.id)
          : []
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isLiked: likedRestaurantsId.includes(r.id)
        }))
        // * cb 第一位是留給 error，因此成功的話則為 null
        return cb(null, {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => cb(err))
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

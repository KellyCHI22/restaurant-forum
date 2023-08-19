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
  getRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      nest: true,
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'VisitedUsers' }
      ],
      // need to define the order at the top level and indicate the model
      order: [[{ model: Comment }, 'createdAt', 'DESC']]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        restaurant.increment('view_counts')
        return restaurant
      })
      .then(restaurant => {
        const isFavorited = restaurant.FavoritedUsers.some(
          f => f.id === req.user.id
        )
        const isVisited = restaurant.VisitedUsers.some(
          f => f.id === req.user.id
        )
        return cb(null, {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isVisited
        })
      })
      .catch(err => cb(err))
  },
  getDashboard: (req, cb) => {
    return Restaurant.findByPk(req.params.id, {
      include: [Category, Comment]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return cb(null, { restaurant: restaurant.toJSON() })
      })
      .catch(err => cb(err))
  },
  getFeeds: (req, cb) => {
    const limit = req.query.limit || 10
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
    ])
      .then(([restaurants, comments]) => cb(null, { restaurants, comments }))
      .catch(err => next(err))
  },
  getLatestRestaurants: (req, cb) => {
    const limit = parseInt(req.query.limit) || 10
    return Restaurant.findAll({
      // 取最新的 10 筆餐廳資料
      limit,
      order: [['createdAt', 'DESC']],
      include: [Category],
      raw: true,
      nest: true
    })
      .then(restaurants => cb(null, { restaurants }))
      .catch(err => cb(err))
  },
  // ? 不知道怎麼用 sequelize 去執行 sort
  getTopRestaurants: (req, cb) => {
    const limit = parseInt(req.query.limit) || 10
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }],
      limit
    })
      .then(restaurants => {
        return restaurants
          .map(r => ({
            ...r.toJSON(),
            favoritedUsersCount: r.FavoritedUsers.length
          }))
          .sort((a, b) => b.favoritedUsersCount - a.favoritedUsersCount)
      })
      .then(restaurants => {
        const favoritedRestaurantsId =
          req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const visitedRestaurantsId =
          req.user && req.user.VisitedRestaurants.map(fr => fr.id)

        const result = restaurants.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isVisited: visitedRestaurantsId.includes(r.id)
        }))
        return cb(null, { restaurants: result })
      })
      .catch(err => cb(err))
  }
}
module.exports = restaurantService

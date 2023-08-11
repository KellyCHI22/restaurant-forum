const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    // 從網址上拿下來的參數是字串，先轉成 Number 再操作
    const categoryId = Number(req.query.categoryId) || ''
    // 從 query string 取得 page & limit
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT // 未來可擴充讓使用者選擇「每頁顯示 N 筆」的功能
    const offset = getOffset(limit, page)

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
    ])
      .then(([restaurants, categories]) => {
        // 先取出登入 user 的收藏餐廳清單，以增進效能
        const favoritedRestaurantsId =
          req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const visitedRestaurantsId =
          req.user && req.user.VisitedRestaurants.map(fr => fr.id)

        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id),
          isVisited: visitedRestaurantsId.includes(r.id)
        }))
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
          pagination: getPagination(limit, page, restaurants.count) // 把 pagination 資料傳回樣板
        })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
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

        // 使用 some() 來減少不必要的計算
        const isFavorited = restaurant.FavoritedUsers.some(
          f => f.id === req.user.id
        )
        const isVisited = restaurant.VisitedUsers.some(
          f => f.id === req.user.id
        )
        res.render('restaurant', {
          restaurant: restaurant.toJSON(),
          isFavorited,
          isVisited
        })
      })
      .catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      include: [Category, Comment]
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    return Promise.all([
      Restaurant.findAll({
        // 取最新的 10 筆餐廳資料
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [Category],
        raw: true,
        nest: true
      }),
      Comment.findAll({
        // 取最新的 10 筆留言
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [User, Restaurant],
        raw: true,
        nest: true
      })
    ])
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  // ? 不知道怎麼用 sequelize 去執行 sort
  getTopRestaurants: (req, res, next) => {
    return Restaurant.findAll({
      include: [{ model: User, as: 'FavoritedUsers' }],
      limit: 10
    })
      .then(restaurants => {
        const favoritedRestaurantsId =
          req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const visitedRestaurantsId =
          req.user && req.user.VisitedRestaurants.map(fr => fr.id)

        const result = restaurants
          .map(r => ({
            ...r.toJSON(),
            description: r.description.substring(0, 50),
            favoritedUsersCount: r.FavoritedUsers.length,
            isFavorited: favoritedRestaurantsId.includes(r.id),
            isVisited: visitedRestaurantsId.includes(r.id)
          }))
          .sort((a, b) => b.favoritedUsersCount - a.favoritedUsersCount)
        return res.render('top-restaurants', {
          restaurants: result
        })
      })
      .catch(err => next(err))
  }
}
module.exports = restaurantController

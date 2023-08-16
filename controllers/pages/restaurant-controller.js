const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const restaurantService = require('../../services/restaurant-service')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return restaurantService
      .getRestaurants(categoryId, limit, offset, next)
      .then(([restaurants, categories]) => {
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
          pagination: getPagination(limit, page, restaurants.count)
        })
      })
      .catch(err => next(err))
  },
  getRestaurant: (req, res, next) => {
    return restaurantService
      .getRestaurant(req.params.id, next)
      .then(restaurant => {
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
    return restaurantService
      .getDashboard(req.params.id, next)
      .then(restaurant => {
        res.render('dashboard', { restaurant: restaurant.toJSON() })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    const limit = 10
    return restaurantService
      .getFeeds(limit, next)
      .then(([restaurants, comments]) => {
        res.render('feeds', {
          restaurants,
          comments
        })
      })
      .catch(err => next(err))
  },
  getTopRestaurants: (req, res, next) => {
    const limit = 10
    return restaurantService
      .getTopRestaurants(limit, next)
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
        return result
      })
      .then(result =>
        res.render('top-restaurants', {
          restaurants: result
        })
      )
      .catch(err => next(err))
  }
}
module.exports = restaurantController

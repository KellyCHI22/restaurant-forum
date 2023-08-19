const restaurantService = require('../../services/restaurant-service')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.render('restaurants', data)
    )
  },
  getRestaurant: (req, res, next) => {
    return restaurantService.getRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.render('restaurant', data)
    })
  },
  getDashboard: (req, res, next) => {
    return restaurantService.getDashboard(req, (err, data) => {
      if (err) return next(err)
      res.render('dashboard', data)
    })
  },
  getFeeds: (req, res, next) => {
    return restaurantService.getFeeds(req, (err, data) => {
      if (err) return next(err)
      res.render('feeds', data)
    })
  },
  getTopRestaurants: (req, res, next) => {
    return restaurantService.getTopRestaurants(req, (err, data) => {
      if (err) return next(err)
      res.render('top-restaurants', data)
    })
  }
}
module.exports = restaurantController

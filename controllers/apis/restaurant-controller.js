const restaurantService = require('../../services/restaurant-service')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getRestaurant: (req, res, next) => {
    restaurantService.getRestaurant(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getLatestRestaurants: (req, res, next) => {
    restaurantService.getLatestRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  getTopRestaurants: (req, res, next) => {
    restaurantService.getTopRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  }
}
module.exports = restaurantController

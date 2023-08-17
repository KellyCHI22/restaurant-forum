const restaurantService = require('../../services/restaurant-service')

const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  }
}
module.exports = restaurantController

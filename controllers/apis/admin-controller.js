const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.json(data)
    )
  }
}
module.exports = adminController

const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  deleteRestaurant: (req, res, next) => {
    return adminService.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  }
}
module.exports = adminController

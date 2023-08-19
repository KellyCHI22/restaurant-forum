const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, next) => {
    adminService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.json({ status: 'success', data })
    )
  },
  postRestaurant: (req, res, next) => {
    adminService.postRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  getRestaurant: (req, res, next) => {
    adminService.getRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  putRestaurant: (req, res, next) => {
    adminService.putRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  deleteRestaurant: (req, res, next) => {
    adminService.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  getUsers: (req, res, next) => {
    adminService.getUsers(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  patchUser: (req, res, next) => {
    adminService.patchUser(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  }
}
module.exports = adminController

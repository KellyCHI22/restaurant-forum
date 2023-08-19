const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, next) => {
    return adminService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.render('admin/restaurants', data)
    )
  },
  createRestaurant: (req, res, next) => {
    return adminService.createRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.render('admin/create-restaurant', data)
    })
  },
  postRestaurant: (req, res, next) => {
    return adminService.postRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.session.createdData = data
      req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
      return res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
    })
  },
  getRestaurant: (req, res, next) => {
    return adminService.getRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.render('admin/restaurant', data)
    })
  },
  editRestaurant: (req, res, next) => {
    return adminService.editRestaurant(req, (err, data) => {
      if (err) return next(err)
      res.render('admin/edit-restaurant', data)
    })
  },
  putRestaurant: (req, res, next) => {
    return adminService.putRestaurant(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'Restaurant was successfully updated')
      res.redirect('/admin/restaurants')
    })
  },
  deleteRestaurant: (req, res, next) => {
    return adminService.deleteRestaurant(req, (err, data) => {
      if (err) return next(err)
      // 考量安全性，將「被刪除的餐廳」存入 deletedData 中
      req.session.deletedData = data
      req.flash('success_messages', 'Restaurant was successfully deleted')
      return res.redirect('/admin/restaurants')
    })
  },
  getUsers: (req, res, next) => {
    return adminService.getUsers(req, (err, data) => {
      if (err) return next(err)
      res.render('admin/users', data)
    })
  },
  patchUser: (req, res, next) => {
    return adminService.patchUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '使用者權限變更成功')
      res.redirect('/admin/users')
    })
  }
}
module.exports = adminController

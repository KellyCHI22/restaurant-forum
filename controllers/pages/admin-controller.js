const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, next) => {
    return adminService.getRestaurants(req, (err, data) =>
      err ? next(err) : res.render('admin/restaurants', data)
    )
  },
  createRestaurant: (req, res, next) => {
    return adminService
      .createRestaurant(next)
      .then(categories =>
        res.render('admin/create-restaurant', { categories })
      )
      .catch(err => next(err))
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
    return adminService
      .getRestaurant(req.params.id, next)
      .then(restaurant => {
        res.render('admin/restaurant', { restaurant })
      })
      .catch(err => next(err))
  },
  editRestaurant: (req, res, next) => {
    return adminService
      .editRestaurant(req.params.id, next)
      .then(([restaurant, categories]) => {
        res.render('admin/edit-restaurant', { restaurant, categories })
      })
      .catch(err => next(err))
  },
  putRestaurant: (req, res, next) => {
    const { name, tel, address, openingHours, description, categoryId } =
      req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    return adminService
      .putRestaurant(
        req.params.id,
        {
          name,
          tel,
          address,
          openingHours,
          description,
          categoryId,
          file
        },
        next
      )
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully updated')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
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
    return adminService
      .getUsers(next)
      .then(users => res.render('admin/users', { users }))
      .catch(err => next(err))
  },
  patchUsers: (req, res, next) => {
    return adminService
      .patchUsers(req.params.id, next)
      .then(() => {
        req.flash('success_messages', '使用者權限變更成功')
        res.redirect('/admin/users')
      })
      .catch(err => next(err))
  }
}
module.exports = adminController

const { getOffset, getPagination } = require('../../helpers/pagination-helper')
const adminService = require('../../services/admin-service')

const adminController = {
  getRestaurants: (req, res, next) => {
    const DEFAULT_LIMIT = 10
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return adminService
      .getRestaurants(limit, offset, next)
      .then(restaurants =>
        res.render('admin/restaurants', {
          restaurants: restaurants.rows,
          pagination: getPagination(limit, page, restaurants.count)
        })
      )
      .catch(err => next(err))
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
    const { name, tel, address, openingHours, description, categoryId } =
      req.body // 從 req.body 拿出表單裡的資料
    // name 是必填，若發先是空值就會終止程式碼，並在畫面顯示錯誤提示
    // ! 後端需做驗證，防止有心人士調整前端程式碼
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    return adminService
      .postRestaurant(
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
      .then(restaurant => {
        console.log(restaurant.toJSON())
        req.flash('success_messages', 'restaurant was successfully created') // 在畫面顯示成功提示
        res.redirect('/admin/restaurants') // 新增完成後導回後台首頁
      })
      .catch(err => next(err))
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
    return adminService
      .deleteRestaurant(req.params.id, next)
      .then(() => {
        req.flash('success_messages', 'Restaurant was successfully deleted')
        res.redirect('/admin/restaurants')
      })
      .catch(err => next(err))
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

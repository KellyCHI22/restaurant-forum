const { Restaurant, User, Category } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const { localFileHandler } = require('../helpers/file-helpers')

const adminService = {
  getRestaurants: (req, cb) => {
    const DEFAULT_LIMIT = 9
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)

    return Restaurant.findAndCountAll({
      raw: true, //  把 Sequelize 包裝過的一大包物件轉換成格式比較單純的 JS 原生物件
      nest: true, // 把 category 資料包裝成更容易使用的形式
      include: [Category], // 使用 model 的關聯資料時，需要透過 include 把關聯資料拉進來
      limit,
      offset
    })
      .then(restaurants => {
        const data = {
          restaurants: restaurants.rows,
          pagination: getPagination(limit, page, restaurants.count)
        }
        return cb(null, data)
      })
      .catch(err => cb(err))
  },
  createRestaurant: next => {
    return Category.findAll({
      raw: true
    }).catch(err => next(err))
  },
  postRestaurant: (restaurantData, next) => {
    const { name, tel, address, openingHours, description, categoryId, file } =
      restaurantData
    return localFileHandler(file)
      .then(filePath => {
        return Restaurant.create({
          // 產生一個新的 Restaurant 物件實例，並存入資料庫
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || null,
          categoryId,
          viewCounts: 0
        })
      })
      .catch(err => next(err))
  },
  getRestaurant: (restaurantId, next) => {
    return Restaurant.findByPk(restaurantId, {
      // 去資料庫用 id 找一筆資料
      raw: true, // 找到以後整理格式再回傳
      nest: true,
      include: [Category]
    })
      .then(restaurant => {
        //  如果找不到，回傳錯誤訊息，後面不執行
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant
      })
      .catch(err => next(err))
  },
  editRestaurant: (restaurantId, next) => {
    return Promise.all([
      Restaurant.findByPk(restaurantId, { raw: true }),
      Category.findAll({ raw: true })
    ])
      .then(([restaurant, categories]) => {
        if (!restaurant) throw new Error("Restaurant doesn't exist!")
        return [restaurant, categories]
      })
      .catch(err => next(err))
  },
  putRestaurant: (restaurantId, restaurantData, next) => {
    const { name, tel, address, openingHours, description, categoryId, file } =
      restaurantData
    return Promise.all([
      Restaurant.findByPk(restaurantId), // 去資料庫查有沒有這間餐廳
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([restaurant, filePath]) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return restaurant.update({
          name,
          tel,
          address,
          openingHours,
          description,
          image: filePath || restaurant.image,
          // 如果 filePath 是 Truthy (使用者有上傳新照片) 就用 filePath
          // 是 Falsy (使用者沒有上傳新照片) 就沿用原本資料庫內的值
          categoryId
        })
      })
      .catch(err => next(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then(deleteRestaurant => cb(null, { data: deleteRestaurant }))
      .catch(err => cb(err))
  },
  getUsers: next => {
    return User.findAll({
      raw: true
    }).catch(err => next(err))
  },
  patchUsers: (userId, next) => {
    return User.findByPk(userId)
      .then(user => {
        if (!user) throw new Error('User does not exist!')
        if (user.name === 'root') throw new Error('禁止變更 root 權限！')
        return user.update({
          isAdmin: !user.isAdmin
        })
      })
      .catch(err => next(err))
  }
}
module.exports = adminService

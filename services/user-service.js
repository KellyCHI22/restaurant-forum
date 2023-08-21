const bcrypt = require('bcryptjs') // 載入 bcrypt
const { localFileHandler } = require('../helpers/file-helpers')
const { customError } = require('../helpers/error-helper')
const {
  User,
  Comment,
  Restaurant,
  Favorite,
  VisitHistory,
  Followship
} = require('../models')

const userService = {
  signUpUser: (req, cb) => {
    const { name, email, password, passwordCheck } = req.body
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (password !== passwordCheck) {
      throw customError(400, 'Passwords do not match!')
    }
    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw customError(400, 'Email already exists!')
        return bcrypt.hash(password, 10) // 前面加 return
      })
      .then(hash =>
        User.create({
          // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
          name,
          email,
          password: hash
        })
      )
      .then(user => {
        const userData = user.toJSON()
        delete userData.password
        cb(null, { user: userData })
      })
      .catch(err => cb(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  getUser: (req, cb) => {
    const userId = req.params.id
    return Promise.all([
      User.findByPk(userId, {
        nest: true,
        include: [
          // * 加上 attributes 指定需要的資料欄位
          {
            model: Restaurant,
            as: 'FavoritedRestaurants',
            attributes: ['id', 'image']
          },
          {
            model: Restaurant,
            as: 'VisitedRestaurants',
            attributes: ['id', 'image']
          },
          { model: User, as: 'Followers', attributes: ['id', 'image'] },
          { model: User, as: 'Followings', attributes: ['id', 'image'] }
        ],
        attributes: ['id', 'name', 'email', 'image', 'createdAt', 'updatedAt']
      }),
      Comment.findAll({
        where: { userId },
        include: Restaurant,
        nest: true,
        raw: true,
        group: ['Restaurant.id']
      })
    ])
      .then(([user, userComments]) => {
        if (!user) throw customError(404, "User didn't exist!")
        const result = {
          shownUser: {
            ...user.toJSON(),
            isFollowed: req.user.Followings.some(
              following => following.id === user.id
            )
          },
          comments: userComments
        }
        return cb(null, result)
      })
      .catch(err => cb(err))
  },
  editUser: (req, cb) => {
    const userId = req.params.id
    return User.findByPk(userId, {
      nest: true,
      attributes: ['id', 'name']
    })
      .then(user => {
        if (!user) throw customError(404, "User doesn't exist!")
        return cb(null, { shownUser: user.toJSON() })
      })
      .catch(err => cb(err))
  },
  putUser: (req, cb) => {
    const { name } = req.body
    const { file } = req
    const userId = req.params.id
    if (!name) throw customError(400, 'User name is required!')

    return Promise.all([
      User.findByPk(userId), // 去資料庫查有沒有這間餐廳
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([user, filePath]) => {
        if (!user) throw customError(404, "User doesn't exist!")
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(user => cb(null, { user }))
      .catch(err => cb(err))
  },
  addFavorite: (req, cb) => {
    const restaurantId = req.params.restaurantId || req.body.restaurantId
    const userId = req.user.id
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      // * 搜尋 favorite，檢查這個收藏關係是否已經存在
      Favorite.findOne({
        where: {
          userId,
          restaurantId
        }
      })
    ])
      .then(([restaurant, favorite]) => {
        if (!restaurant) throw customError(404, "Restaurant didn't exist!")
        // * 若此收藏關係存在，則丟 error
        if (favorite) {
          throw customError(400, 'You have favorited this restaurant!')
        }

        // * 新增一筆新的 Favorite
        return Favorite.create({
          userId,
          restaurantId
        })
      })
      .then(favorite => cb(null, { favorite }))
      .catch(err => cb(err))
  },
  deleteFavorite: (req, cb) => {
    const restaurantId = req.params.restaurantId || req.body.restaurantId
    const userId = req.user.id
    // * 直接找出該收藏關係，若存在，即刪除
    return Favorite.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) {
          throw customError(404, "You haven't favorited this restaurant")
        }
        return favorite.destroy()
      })
      .then(favorite => cb(null, { deletedFavorite: favorite }))
      .catch(err => cb(err))
  },
  addVisitHistory: (req, cb) => {
    const restaurantId = req.params.restaurantId || req.body.restaurantId
    const userId = req.user.id
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      VisitHistory.findOne({
        where: {
          userId,
          restaurantId
        }
      })
    ])
      .then(([restaurant, visitHistory]) => {
        if (!restaurant) throw customError(404, "Restaurant didn't exist!")
        if (visitHistory) {
          throw customError(
            400,
            'You have already added this restaurant to your history!'
          )
        }
        return VisitHistory.create({
          userId,
          restaurantId
        })
      })
      .then(visitHistory => cb(null, { visitHistory }))
      .catch(err => cb(err))
  },
  deleteVisitHistory: (req, cb) => {
    const restaurantId = req.params.restaurantId || req.body.restaurantId
    const userId = req.user.id
    return VisitHistory.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then(visitHistory => {
        if (!visitHistory) {
          throw customError(
            404,
            "You haven't added this restaurant to your history!"
          )
        }
        return visitHistory.destroy()
      })
      .then(deletedHistory => cb(null, { deletedHistory }))
      .catch(err => cb(err))
  },
  getTopUsers: (req, cb) => {
    const limit = parseInt(req.query.limit) || 5
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [
        {
          model: User,
          as: 'Followers',
          attributes: ['id', 'name', 'image'],
          // https://stackoverflow.com/questions/73267872/how-to-exclude-attributes-from-nested-model-in-sequelize
          through: {
            attributes: []
          }
        }
      ],
      limit
    })
      .then(users => {
        // 整理 users 資料，把每個 user 項目都拿出來處理一次，並把新陣列儲存在 users 裡
        const result = users
          .map(user => ({
            ...user.toJSON(), // 整理格式
            followerCount: user.Followers.length
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        return result
      })
      .then(users => {
        const result = users.map(user => ({
          ...user,
          isFollowed: req.user.Followings.some(f => f.id === user.id)
        }))
        return cb(null, { users: result })
      })
      .catch(err => cb(err))
  },
  // * 追蹤與收藏的邏輯雷同，先反查確定關係尚未存在，再新增追蹤紀錄
  addFollowing: (req, cb) => {
    const followingId = req.params.userId // 要追蹤的使用者
    const followerId = req.params.id || req.user.id // 目前登入的使用者
    if (parseInt(followingId) === parseInt(followerId)) {
      throw customError(400, 'You cannot follow yourself!')
    }
    return Promise.all([
      User.findByPk(followingId),
      Followship.findOne({
        where: {
          followerId,
          followingId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw customError(404, "User didn't exist!")
        if (followship) {
          throw customError(400, 'You are already following this user!')
        }
        return Followship.create({
          followerId,
          followingId
        })
      })
      .then(followship => cb(null, { followship }))
      .catch(err => cb(err))
  },
  deleteFollowing: (req, cb) => {
    const followingId = req.params.userId
    const followerId = req.params.id || req.user.id
    return Followship.findOne({
      where: {
        followerId,
        followingId
      }
    })
      .then(followship => {
        if (!followship) {
          throw customError(404, "You haven't followed this user!")
        }
        return followship.destroy()
      })
      .then(followship => cb(null, { deletedFollowship: followship }))
      .catch(err => cb(err))
  }
}

module.exports = userService

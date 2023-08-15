const bcrypt = require('bcryptjs') // 載入 bcrypt
const { localFileHandler } = require('../helpers/file-helpers')
const {
  User,
  Comment,
  Restaurant,
  Favorite,
  VisitHistory,
  Followship
} = require('../models')

const userService = {
  signUpUser: (name, email, password, next) => {
    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    return User.findOne({ where: { email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
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
      .catch(err => next(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  getUser: (userId, next) => {
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
        ]
      }),
      Comment.findAll({
        where: { userId },
        include: Restaurant,
        nest: true,
        raw: true,
        group: ['Restaurant.id']
      })
    ])
      .then(([user, comments]) => {
        if (!user) throw new Error("User didn't exist!")
        return [user, comments]
      })
      .catch(err => next(err))
  },
  editUser: (userId, next) => {
    return User.findByPk(userId, {
      nest: true,
      attributes: ['id', 'name']
    })
      .then(user => {
        if (!user) throw new Error("User doesn't exist!")
        return user.toJSON()
      })
      .catch(err => next(err))
  },
  putUser: (userId, name, file, next) => {
    return Promise.all([
      User.findByPk(userId), // 去資料庫查有沒有這間餐廳
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User doesn't exist!")
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .catch(err => next(err))
  },
  addFavorite: (userId, restaurantId, next) => {
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
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        // * 若此收藏關係存在，則丟 error
        if (favorite) throw new Error('You have favorited this restaurant!')

        // * 新增一筆新的 Favorite
        return Favorite.create({
          userId,
          restaurantId
        })
      })
      .catch(err => next(err))
  },
  removeFavorite: (userId, restaurantId, next) => {
    // * 直接找出該收藏關係，若存在，即刪除
    return Favorite.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")
        return favorite.destroy()
      })
      .catch(err => next(err))
  },
  addVisitHistory: (userId, restaurantId, next) => {
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
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        if (visitHistory) {
          throw new Error(
            'You have already added this restaurant to your history!'
          )
        }
        return VisitHistory.create({
          userId,
          restaurantId
        })
      })
      .catch(err => next(err))
  },
  removeVisitHistory: (userId, restaurantId, next) => {
    return VisitHistory.findOne({
      where: {
        userId,
        restaurantId
      }
    })
      .then(visitHistory => {
        if (!visitHistory) {
          throw new Error("You haven't added this restaurant to your history!")
        }
        return visitHistory.destroy()
      })
      .catch(err => next(err))
  },
  getTopUsers: (limit, next) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [{ model: User, as: 'Followers' }],
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
      .catch(err => next(err))
  },
  // * 追蹤與收藏的邏輯雷同，先反查確定關係尚未存在，再新增追蹤紀錄
  addFollowing: (followerId, followingId, next) => {
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
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You are already following this user!')
        return Followship.create({
          followerId,
          followingId
        })
      })
      .catch(err => next(err))
  },
  removeFollowing: (followerId, followingId, next) => {
    return Followship.findOne({
      where: {
        followerId,
        followingId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .catch(err => next(err))
  }
}

module.exports = userService

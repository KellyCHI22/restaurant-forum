const bcrypt = require('bcryptjs') // 載入 bcrypt
const {
  User,
  Comment,
  Restaurant,
  Favorite,
  VisitHistory,
  Followship
} = require('../models')
const { localFileHandler } = require('../helpers/file-helpers')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) {
      throw new Error('Passwords do not match!')
    }

    // 確認資料裡面沒有一樣的 email，若有，就建立一個 Error 物件並拋出
    User.findOne({ where: { email: req.body.email } })
      .then(user => {
        if (user) throw new Error('Email already exists!')
        return bcrypt.hash(req.body.password, 10) // 前面加 return
      })
      .then(hash =>
        User.create({
          // 上面錯誤狀況都沒發生，就把使用者的資料寫入資料庫
          name: req.body.name,
          email: req.body.email,
          password: hash
        })
      )
      .then(() => {
        req.flash('success_messages', '成功註冊帳號！') // 並顯示成功訊息
        res.redirect('/signin')
      })
      .catch(err => next(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
  },
  signInPage: (req, res) => {
    res.render('signin')
  },
  signIn: (req, res) => {
    req.flash('success_messages', '成功登入！')
    res.redirect('/restaurants')
  },
  logout: (req, res) => {
    req.flash('success_messages', '登出成功！')
    req.logout() // 把 user id 對應的 session 清除掉
    res.redirect('/signin')
  },
  getUser: (req, res, next) => {
    Promise.all([
      User.findByPk(req.params.id, {
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
        where: { userId: req.params.id },
        include: Restaurant,
        nest: true,
        raw: true,
        group: ['Restaurant.id']
      })
    ])
      .then(([user, comments]) => {
        if (!user) throw new Error("User didn't exist!")
        res.render('users/profile', {
          shownUser: {
            ...user.toJSON(),
            isFollowed: req.user.Followings.some(
              following => following.id === user.id
            )
          },
          comments
        })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    if (parseInt(req.params.id) !== parseInt(req.user.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    User.findByPk(req.params.id, {
      nest: true,
      include: [Comment]
    })
      .then(user => {
        if (!user) throw new Error("User doesn't exist!")
        console.log(user)
        res.render('users/edit', { shownUser: user.toJSON() })
      })
      .catch(err => next(err))
  },
  putUser: (req, res, next) => {
    if (parseInt(req.params.id) !== parseInt(req.user.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    const { name } = req.body
    const { file } = req
    if (!name) throw new Error('User name is required!')
    Promise.all([
      User.findByPk(req.params.id), // 去資料庫查有沒有這間餐廳
      localFileHandler(file) // 把檔案傳到 file-helper 處理
    ])
      .then(([user, filePath]) => {
        if (!user) throw new Error("User doesn't exist!")
        return user.update({
          name,
          image: filePath || user.image
        })
      })
      .then(() => {
        req.flash('success_messages', 'User was successfully updated')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      // * 搜尋 favorite，檢查這個收藏關係是否已經存在
      Favorite.findOne({
        where: {
          userId: req.user.id,
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
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    // * 直接找出該收藏關係，若存在，即刪除
    return Favorite.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(favorite => {
        if (!favorite) throw new Error("You haven't favorited this restaurant")

        return favorite.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addVisitHistory: (req, res, next) => {
    const { restaurantId } = req.params
    return Promise.all([
      Restaurant.findByPk(restaurantId),
      VisitHistory.findOne({
        where: {
          userId: req.user.id,
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
          userId: req.user.id,
          restaurantId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeVisitHistory: (req, res, next) => {
    return VisitHistory.findOne({
      where: {
        userId: req.user.id,
        restaurantId: req.params.restaurantId
      }
    })
      .then(visitHistory => {
        if (!visitHistory) {
          throw new Error("You haven't added this restaurant to your history!")
        }

        return visitHistory.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    // 撈出所有 User 與 followers 資料
    return User.findAll({
      include: [{ model: User, as: 'Followers' }]
    })
      .then(users => {
        // 整理 users 資料，把每個 user 項目都拿出來處理一次，並把新陣列儲存在 users 裡
        const result = users
          .map(user => ({
            ...user.toJSON(), // 整理格式
            followerCount: user.Followers.length,
            isFollowed: req.user.Followings.some(f => f.id === user.id)
          }))
          .sort((a, b) => b.followerCount - a.followerCount)
        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  // * 追蹤與收藏的邏輯雷同，先反查確定關係尚未存在，再新增追蹤紀錄
  addFollowing: (req, res, next) => {
    const { userId } = req.params
    if (parseInt(userId) === parseInt(req.user.id)) {
      throw new Error('You cannot follow yourself!')
    }
    Promise.all([
      User.findByPk(userId),
      Followship.findOne({
        where: {
          followerId: req.user.id,
          followingId: req.params.userId
        }
      })
    ])
      .then(([user, followship]) => {
        if (!user) throw new Error("User didn't exist!")
        if (followship) throw new Error('You are already following this user!')
        return Followship.create({
          followerId: req.user.id,
          followingId: userId
        })
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    Followship.findOne({
      where: {
        followerId: req.user.id,
        followingId: req.params.userId
      }
    })
      .then(followship => {
        if (!followship) throw new Error("You haven't followed this user!")
        return followship.destroy()
      })
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController

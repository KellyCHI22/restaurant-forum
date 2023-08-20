const jwt = require('jsonwebtoken')
const userService = require('../../services/user-service')

const userController = {
  signUp: (req, res, next) => {
    userService.signUpUser(req, (err, data) => {
      if (err) return next(err) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
      res.json({ status: 'success', data })
    })
  },
  signIn: (req, res, next) => {
    try {
      const userData = req.user.toJSON()
      delete userData.password // 刪除密碼，避免將敏感資料傳給前端
      // 簽發 JWT，效期為 30 天
      const token = jwt.sign(userData, process.env.JWT_SECRET, {
        expiresIn: '30d'
      })
      res.json({
        status: 'success',
        data: {
          token,
          user: userData
        }
      })
    } catch (err) {
      next(err)
      // jwt.sign() 本身不是非同步事件，執行完成後也不會回傳 Promise 物件
      // 因此需要用 try & catch 來處理錯誤時的情況
    }
  },
  getUser: (req, res, next) => {
    userService.getUser(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  putUser: (req, res, next) => {
    userService.putUser(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  addFavorite: (req, res, next) => {
    userService.addFavorite(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  deleteFavorite: (req, res, next) => {
    userService.deleteFavorite(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  addVisitHistory: (req, res, next) => {
    userService.addVisitHistory(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  deleteVisitHistory: (req, res, next) => {
    userService.deleteVisitHistory(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  getTopUsers: (req, res, next) => {
    userService.getTopUsers(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  addFollowing: (req, res, next) => {
    userService.addFollowing(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  },
  deleteFollowing: (req, res, next) => {
    userService.deleteFollowing(req, (err, data) => {
      if (err) return next(err)
      res.json({ status: 'success', data })
    })
  }
}

module.exports = userController

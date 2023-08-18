const jwt = require('jsonwebtoken')
const userService = require('../../services/user-service')

const userController = {
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) {
      throw new Error('Passwords do not match!')
    }
    return userService
      .signUpUser(req.body.name, req.body.email, req.body.password, next)
      .then(user => {
        const userData = user.toJSON()
        delete userData.password
        res.json({
          status: 'success',
          data: {
            user: userData
          }
        })
      })
      .catch(err => next(err)) // 接住前面拋出的錯誤，呼叫專門做錯誤處理的 middleware
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
  }
}

module.exports = userController

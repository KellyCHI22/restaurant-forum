const jwt = require('jsonwebtoken')

const userController = {
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

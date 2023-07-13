// 把 req.user 再包裝成一支 getUser 函式並導出
const getUser = req => {
  return req.user || null
}

const ensureAuthenticated = req => {
  return req.isAuthenticated()
}
module.exports = {
  getUser,
  ensureAuthenticated // 新增這裡
}

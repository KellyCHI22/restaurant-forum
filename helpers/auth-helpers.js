// 把 req.user 再包裝成一支 getUser 函式並導出

const getUser = req => {
  return req.user || null
}
module.exports = {
  getUser
}

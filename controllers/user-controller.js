const userService = require('../services/user-service')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    // 如果兩次輸入的密碼不同，就建立一個 Error 物件並拋出
    if (req.body.password !== req.body.passwordCheck) {
      throw new Error('Passwords do not match!')
    }
    return userService
      .signUpUser(req.body.name, req.body.email, req.body.password, next)
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
    return userService
      .getUser(req.params.id)
      .then(([user, userComments]) => {
        res.render('users/profile', {
          shownUser: {
            ...user.toJSON(),
            isFollowed: req.user.Followings.some(
              following => following.id === user.id
            )
          },
          comments: userComments
        })
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    if (parseInt(req.params.id) !== parseInt(req.user.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    return userService
      .editUser(req.params.id)
      .then(user => {
        res.render('users/edit', { shownUser: user })
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
    return userService
      .putUser(req.params.id, name, file, next)
      .then(() => {
        req.flash('success_messages', 'User was successfully updated')
        res.redirect(`/users/${req.params.id}`)
      })
      .catch(err => next(err))
  },
  addFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return userService
      .addFavorite(req.user.id, restaurantId, next)
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFavorite: (req, res, next) => {
    const { restaurantId } = req.params
    return userService
      .removeFavorite(req.user.id, restaurantId, next)
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  addVisitHistory: (req, res, next) => {
    const { restaurantId } = req.params
    return userService
      .addVisitHistory(req.user.id, restaurantId, next)
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeVisitHistory: (req, res, next) => {
    const { restaurantId } = req.params
    return userService
      .removeVisitHistory(req.user.id, restaurantId, next)
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  getTopUsers: (req, res, next) => {
    const limit = 5
    return userService
      .getTopUsers(limit, next)
      .then(users => {
        const result = users.map(user => ({
          ...user,
          isFollowed: req.user.Followings.some(f => f.id === user.id)
        }))
        res.render('top-users', { users: result })
      })
      .catch(err => next(err))
  },
  addFollowing: (req, res, next) => {
    const followingId = req.params.userId
    const followerId = req.user.id
    if (parseInt(followingId) === parseInt(followerId)) {
      throw new Error('You cannot follow yourself!')
    }
    return userService
      .addFollowing(followerId, followingId, next)
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  },
  removeFollowing: (req, res, next) => {
    const followingId = req.params.userId
    const followerId = req.user.id
    return userService
      .removeFollowing(followerId, followingId, next)
      .then(() => res.redirect('back'))
      .catch(err => next(err))
  }
}

module.exports = userController

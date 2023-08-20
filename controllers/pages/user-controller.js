const userService = require('../../services/user-service')

const userController = {
  signUpPage: (req, res) => {
    res.render('signup')
  },
  signUp: (req, res, next) => {
    return userService.signUpUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', '成功註冊帳號！') // 並顯示成功訊息
      res.redirect('/signin')
    })
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
      .getUser(req, (err, data) => {
        if (err) return next(err)
        res.render('users/profile', data)
      })
      .catch(err => next(err))
  },
  editUser: (req, res, next) => {
    if (parseInt(req.params.id) !== parseInt(req.user.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    return userService.editUser(req, (err, data) => {
      if (err) return next(err)
      res.render('users/edit', data)
    })
  },
  putUser: (req, res, next) => {
    if (parseInt(req.params.id) !== parseInt(req.user.id)) {
      return res.redirect(`/users/${req.params.id}`)
    }
    return userService.putUser(req, (err, data) => {
      if (err) return next(err)
      req.flash('success_messages', 'User was successfully updated')
      res.redirect(`/users/${req.params.id}`)
    })
  },
  addFavorite: (req, res, next) => {
    return userService.addFavorite(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  deleteFavorite: (req, res, next) => {
    return userService.deleteFavorite(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  addVisitHistory: (req, res, next) => {
    return userService.addVisitHistory(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  deleteVisitHistory: (req, res, next) => {
    return userService.deleteVisitHistory(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  getTopUsers: (req, res, next) => {
    return userService.getTopUsers(req, (err, data) => {
      if (err) return next(err)
      res.render('top-users', data)
    })
  },
  addFollowing: (req, res, next) => {
    return userService.addFollowing(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  },
  deleteFollowing: (req, res, next) => {
    return userService.deleteFollowing(req, (err, data) => {
      if (err) return next(err)
      res.redirect('back')
    })
  }
}

module.exports = userController

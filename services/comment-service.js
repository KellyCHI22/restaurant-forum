const { Comment, User, Restaurant } = require('../models')
const commentService = {
  postComment: (userId, restaurantId, text, next) => {
    return Promise.all([
      User.findByPk(userId),
      Restaurant.findByPk(restaurantId)
    ])
      .then(([user, restaurant]) => {
        if (!user) throw new Error("User didn't exist!")
        if (!restaurant) throw new Error("Restaurant didn't exist!")
        return Comment.create({
          text,
          restaurantId,
          userId
        })
      })
      .catch(err => next(err))
  },
  deleteComment: (commentId, next) => {
    return Comment.findByPk(commentId)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.destroy()
      })
      .catch(err => next(err))
  }
}

module.exports = commentService

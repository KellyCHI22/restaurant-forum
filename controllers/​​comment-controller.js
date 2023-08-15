const commentService = require('../services/comment-service')

const commentController = {
  postComment: (req, res, next) => {
    const { restaurantId, text } = req.body
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
    return commentService
      .postComment(userId, restaurantId, text, next)
      .then(() => {
        res.redirect(`/restaurants/${restaurantId}`)
      })
      .catch(err => next(err))
  },
  deleteComment: (req, res, next) => {
    return commentService
      .deleteComment(req.params.id, next)
      .then(deletedComment =>
        res.redirect(`/restaurants/${deletedComment.restaurantId}`)
      )
      .catch(err => next(err))
  }
}

module.exports = commentController

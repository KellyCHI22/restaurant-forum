const commentService = require('../../services/comment-service')

const commentController = {
  postComment: (req, res, next) => {
    commentService.postComment(req, (err, data) => {
      if (err) return next(err)
      res.redirect(`/restaurants/${req.body.restaurantId}`)
    })
  },
  deleteComment: (req, res, next) => {
    return commentService.deleteComment(req, (err, data) => {
      if (err) return next(err)
      res.redirect(`/restaurants/${data.comment.restaurantId}`)
    })
  }
}

module.exports = commentController

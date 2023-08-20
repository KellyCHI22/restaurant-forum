const { Comment, User, Restaurant } = require('../models')

const commentService = {
  getComments: (req, cb) => {
    const restaurantId = req.params.id
    return Comment.findAll({
      where: { restaurantId },
      include: [{ model: User, attributes: ['id', 'name', 'image'] }],
      nest: true,
      raw: true,
      group: ['User.id']
    })
      .then(comments => cb(null, { comments }))
      .catch(err => cb(err))
  },
  getLatestComments: (req, cb) => {
    const limit = parseInt(req.query.limit) || 10
    return Comment.findAll({
      limit,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['id', 'name', 'image'] }],
      nest: true,
      raw: true
    })
      .then(comments => cb(null, { comments }))
      .catch(err => cb(err))
  },
  postComment: (req, cb) => {
    const { text } = req.body
    const restaurantId = req.params.id || req.body.restaurantId
    const userId = req.user.id
    if (!text) throw new Error('Comment text is required!')
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
      .then(comment => cb(null, { comment }))
      .catch(err => cb(err))
  },
  deleteComment: (req, cb) => {
    const commentId = req.params.commentId || req.params.id
    return Comment.findByPk(commentId)
      .then(comment => {
        if (!comment) throw new Error("Comment didn't exist!")
        return comment.destroy()
      })
      .then(comment => cb(null, { comment }))
      .catch(err => cb(err))
  }
}

module.exports = commentService

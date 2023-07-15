const { Restaurant } = require('../models');

const adminController = {
  getRestaurants: (req, res, next) => {
    Restaurant.findAll({
      raw: true, //  把 Sequelize 包裝過的一大包物件轉換成格式比較單純的 JS 原生物件
    })
      .then((restaurants) => res.render('admin/restaurants', { restaurants }))
      .catch((err) => next(err));
  },
};
module.exports = adminController;

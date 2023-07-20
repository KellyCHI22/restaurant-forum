const { Restaurant, Category } = require('../models');
const restaurantController = {
  getRestaurants: (req, res, next) => {
    // 從網址上拿下來的參數是字串，先轉成 Number 再操作
    const categoryId = Number(req.query.categoryId) || '';
    return Promise.all([
      Restaurant.findAll({
        include: Category,
        where: {
          // 新增查詢條件
          ...(categoryId ? { categoryId } : {}), // 檢查 categoryId 是否為空值
        },
        nest: true,
        raw: true,
      }),
      Category.findAll({ raw: true }),
    ])
      .then(([restaurants, categories]) => {
        const data = restaurants.map((r) => ({
          ...r,
          description: r.description.substring(0, 50),
        }));
        return res.render('restaurants', {
          restaurants: data,
          categories,
          categoryId,
        });
      })
      .catch((err) => next(err));
  },
  getRestaurant: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      nest: true,
      include: [Category],
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!");
        restaurant.increment('view_counts');
        res.render('restaurant', { restaurant: restaurant.toJSON() });
      })
      .catch((err) => next(err));
  },
  getDashboard: (req, res, next) => {
    Restaurant.findByPk(req.params.id, {
      raw: true,
      nest: true,
      include: [Category],
    })
      .then((restaurant) => {
        if (!restaurant) throw new Error("Restaurant didn't exist!");
        res.render('dashboard', { restaurant });
      })
      .catch((err) => next(err));
  },
};
module.exports = restaurantController;

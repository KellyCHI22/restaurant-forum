'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 注意這邊是要直接操作資料庫欄位，要寫 snake case 的 category_id
    await queryInterface.addColumn('Restaurants', 'category_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      //  明確指定在這筆 migration 生效時，需要一併把關聯設定起來
      references: {
        model: 'Categories',
        key: 'id'
      }
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'category_id')
  }
}

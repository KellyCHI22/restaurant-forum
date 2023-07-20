'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 注意這邊是要直接操作資料庫欄位，要寫 snake case 的 category_id
    await queryInterface.addColumn('Restaurants', 'view_counts', {
      type: Sequelize.INTEGER,
      allowNull: false
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Restaurants', 'view_counts')
  }
}

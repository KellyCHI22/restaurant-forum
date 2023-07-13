'use strict'
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // ! 在直接操作資料庫的情況，字串並不會被自動轉換
    await queryInterface.addColumn('Users', 'is_admin', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    })
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Users', 'is_admin')
  }
}

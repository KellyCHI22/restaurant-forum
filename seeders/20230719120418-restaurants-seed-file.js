'use strict'
const { faker } = require('@faker-js/faker')
module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 新增以下三行，先去查詢現在 Categories 的 id 有哪些
    const categories = await queryInterface.sequelize.query(
      'SELECT id FROM Categories;',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    )
    await queryInterface.bulkInsert(
      'Restaurants',
      Array.from({ length: 50 }, () => ({
        name: faker.company.name(),
        tel: faker.phone.number(),
        address: faker.location.streetAddress({ useFullAddress: true }),
        opening_hours: '08:00',
        image: `https://loremflickr.com/320/240/restaurant,food/?random=${
          Math.random() * 100
        }`,
        description: faker.lorem.text(),
        created_at: new Date(),
        updated_at: new Date(),
        category_id:
          categories[Math.floor(Math.random() * categories.length)].id // 增加這裡
      }))
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Restaurants', {})
  }
}

'use strict'
const { faker } = require('@faker-js/faker')

module.exports = {
  up: async (queryInterface, Sequelize) => {
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
        updated_at: new Date()
      }))
    )
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Restaurants', {})
  }
}

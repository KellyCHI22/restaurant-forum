'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class Restaurant extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
      Restaurant.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        // onDelete: when a Category record is deleted,
        // the categoryId foreign key in the Restaurant model will be set to NULL
        onDelete: 'SET NULL',
        // when the primary key of the Category model is updated,
        // the corresponding categoryId foreign key in the Restaurant model
        // will also be updated with the new value.
        onUpdate: 'CASCADE'
      })
    }
  }
  Restaurant.init(
    {
      name: DataTypes.STRING,
      tel: DataTypes.STRING,
      address: DataTypes.STRING,
      openingHours: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Restaurant',
      tableName: 'Restaurants',
      underscored: true
    }
  )
  return Restaurant
}

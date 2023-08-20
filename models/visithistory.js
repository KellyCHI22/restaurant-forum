'use strict'
const { Model } = require('sequelize')
module.exports = (sequelize, DataTypes) => {
  class VisitHistory extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate (models) {
      // define association here
    }
  }
  VisitHistory.init(
    {
      userId: DataTypes.INTEGER,
      restaurantId: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: 'VisitHistory',
      tableName: 'VisitHistories',
      underscored: true
    }
  )
  return VisitHistory
}

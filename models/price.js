'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Price extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Price.init({
    price: DataTypes.FLOAT,
    high: DataTypes.FLOAT,
    low: DataTypes.FLOAT,
    from: DataTypes.FLOAT,
    to: DataTypes.FLOAT,
    fromDate: DataTypes.DATE,
    toDate: DataTypes.DATE,
    datetime: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'Prices',
  });
  return Price;
};
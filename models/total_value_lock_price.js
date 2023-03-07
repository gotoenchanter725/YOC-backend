'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class TotalValueLockPrice extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  TotalValueLockPrice.init({
    fromDate: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'total_value_lock_price',
  });
  return TotalValueLockPrice;
};
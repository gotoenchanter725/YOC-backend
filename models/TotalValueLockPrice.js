module.exports = (sequelize, DataTypes) => {

  const TotalValueLockPriceModel = sequelize.define('TotalValueLockPrice', {
    high: {
      type: DataTypes.FLOAT
    },
    low: {
      type: DataTypes.FLOAT
    },
    from: {
      type: DataTypes.FLOAT
    },
    to: {
      type: DataTypes.FLOAT
    },
    price: {
      type: DataTypes.FLOAT
    },
    fromDate: {
      type: DataTypes.DATE
    },
    toDate: {
      type: DataTypes.DATE
    },
    datetime: {
      type: DataTypes.DATE
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    tableName: "total_value_lock_prices", 
  });

  return TotalValueLockPriceModel;
};
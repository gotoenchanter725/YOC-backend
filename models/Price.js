module.exports = (sequelize, DataTypes) => {

  const PriceModel = sequelize.define('Price', {
    price: DataTypes.FLOAT,
    high: DataTypes.FLOAT,
    low: DataTypes.FLOAT,
    from: DataTypes.FLOAT,
    to: DataTypes.FLOAT,
    fromDate: DataTypes.DATE,
    toDate: DataTypes.DATE,
    datetime: DataTypes.DATE, 
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    tableName: "prices", 
  });

  return PriceModel;
};
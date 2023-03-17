module.exports = (sequelize, DataTypes) => {
  const CurrencyModel = sequelize.define('Currency', {
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    address: DataTypes.STRING,
    description: DataTypes.STRING, 
    image: DataTypes.STRING, 
    decimal: DataTypes.INTEGER, 
    isDelete: DataTypes.BOOLEAN, 
    isActive: DataTypes.BOOLEAN, 

    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    tableName: "currencies"
  });

  CurrencyModel.associate = function (models) {
  }

  return CurrencyModel;
};
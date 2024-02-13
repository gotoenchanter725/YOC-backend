module.exports = (sequelize, DataTypes) => {
  const CurrencyModel = sequelize.define('Currency', {
    name: DataTypes.STRING,
    symbol: DataTypes.STRING,
    address: DataTypes.STRING,
    description: DataTypes.STRING,
    image: DataTypes.STRING,
    decimals: DataTypes.INTEGER,
    price: DataTypes.STRING, // USD price, exactly USDC token amount
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
    // CurrencyModel.hasOne(models.Liquidity, { foreignKey: 'id' });
    CurrencyModel.hasOne(models.StakePool, { foreignKey: 'token' });
  }

  return CurrencyModel;
};
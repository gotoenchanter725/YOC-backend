module.exports = (sequelize, DataTypes) => {

  const LiquidityModel = sequelize.define('Liquidity', {
      poolId: DataTypes.INTEGER,
      pairAddress: DataTypes.STRING,
      pairDecimals: DataTypes.INTEGER,
      pairSymbol: DataTypes.STRING,
      isYoc: DataTypes.BOOLEAN,
      token0Address: DataTypes.STRING,
      token1Address: DataTypes.STRING,
      token0Symbol: DataTypes.STRING,
      token1Symbol: DataTypes.STRING,
      token0Decimals: DataTypes.INTEGER,
      token1Decimals: DataTypes.INTEGER,
      isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
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
      tableName: 'liquidity', 
  });

  LiquidityModel.associate = function (models) {
  };
  return LiquidityModel;
};
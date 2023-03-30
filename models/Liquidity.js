module.exports = (sequelize, DataTypes) => {

  const LiquidityModel = sequelize.define('Liquidity', {
    poolId: DataTypes.INTEGER,
    pairAddress: DataTypes.STRING,
    pairDecimals: DataTypes.INTEGER,
    pairSymbol: DataTypes.STRING,
    isYoc: DataTypes.BOOLEAN,
    token0: DataTypes.INTEGER,
    token1: DataTypes.INTEGER,

    amount: { // LP amount
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    amount0: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    amount1: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    rate: {
      type: DataTypes.STRING,
      defaultValue: ""
    },


    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isDelete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
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
    LiquidityModel.belongsTo(models.Currency, { as: 'currency0', foreignKey: 'token0' });
    LiquidityModel.belongsTo(models.Currency, { as: 'currency1', foreignKey: 'token1' });
    LiquidityModel.hasOne(models.LiquidityDetail, { foreignKey: 'liquidityId' });
    LiquidityModel.hasOne(models.FarmPool, { foreignKey: 'liquidityId' });
  };
  return LiquidityModel;
};
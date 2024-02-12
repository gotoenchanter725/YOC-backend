module.exports = (sequelize, DataTypes) => {
  const ProjectModel = sequelize.define('Project', {
    projectTitle: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    iconUrl: DataTypes.STRING,
    address: DataTypes.STRING,
    poolId: DataTypes.INTEGER,
    multiplier: DataTypes.INTEGER,
    status: DataTypes.STRING,
    ptokenAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    projectWallet: {
      type: DataTypes.STRING,
      allowNull: false
    },
    ptokenDecimals: DataTypes.INTEGER,
    ptokenSymbol: DataTypes.STRING,
    ptokenTotalSupply: DataTypes.STRING,
    ptokenSellAmount: DataTypes.STRING,
    ptokenPoolAmount: DataTypes.STRING,
    YUSDTradePoolAmount: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    ptokenPrice: DataTypes.STRING,
    ptokenTradeBalance: {
      type: DataTypes.STRING,
      defaultValue: "0"
    },
    tradePause: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    manuallySecondaryMarketplace: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    endDate: DataTypes.DATE,
    isDeleted: {
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
    tableName: 'projects',
  });

  ProjectModel.associate = function (models) {
    // associations can be defined here
    ProjectModel.hasMany(models.VotingQuery, {
      foreignKey: 'projectTitle'
    })
    ProjectModel.hasMany(models.TradeOrder, { foreignKey: 'ptokenAddress', sourceKey: 'ptokenAddress', as: 'orders' });
    ProjectModel.hasMany(models.TradePrice, { foreignKey: 'ptokenAddress', sourceKey: 'ptokenAddress', as: 'prices' });
  };

  return ProjectModel;
};
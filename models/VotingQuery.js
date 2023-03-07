module.exports = (sequelize, DataTypes) => {

  const VotingQueryModel = sequelize.define('VotingQuery', {
    projectTitle: DataTypes.STRING,
    queryTitle: DataTypes.STRING,
    queryContent: DataTypes.STRING,
    amountAnswer: DataTypes.INTEGER,
    answerStr: DataTypes.STRING,
    totalResult: DataTypes.STRING,
    votedWeight: DataTypes.FLOAT,
    startDate: DataTypes.DATE,
    endDate: DataTypes.DATE,
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE
    }
  }, {
    tableName: 'voting_queries', 
  });

  VotingQueryModel.associate = function (models) {
    VotingQueryModel.belongsTo(models.Project, { foreignKey: 'projectTitle' });
    VotingQueryModel.hasMany(models.VotingDetail, { foreignKey: 'queryId' })
  };

  return VotingQueryModel;
};
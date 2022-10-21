module.exports = (sequelize, DataTypes) => {
  const VotingQuery = sequelize.define('VotingQuery', {
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
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {});
  VotingQuery.associate = function (models) {
    // associations can be defined here
    // Project.belongsTo(models.User, {
    //     foreignKey: 'userId',
    //     onDelete: 'CASCADE'
    // })
    VotingQuery.hasMany(models.VotingDetail, {
      foreignKey: 'projectTitle'
    })
  };
  return VotingQuery;
};
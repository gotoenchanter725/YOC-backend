'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class VotingQuery extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  VotingQuery.init({
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
  }, {
    sequelize,
    modelName: 'voting_query',
  });


  VotingQuery.associate = function (models) {
    // associations can be defined here
    // Project.belongsTo(models.User, {
    //     foreignKey: 'userId',
    //     onDelete: 'CASCADE'
    // })
    VotingQuery.belongsTo(models.Project, { foreignKey: 'projectTitle' });
    VotingQuery.hasMany(models.VotingDetail, { foreignKey: 'queryId' })
  };

  return VotingQuery;
};
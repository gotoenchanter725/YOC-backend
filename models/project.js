'use strict';

module.exports = (sequelize, DataTypes) => {
  const Project = sequelize.define('project', {
    projectTitle: DataTypes.STRING,
    iconUrl: DataTypes.STRING,
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
  Project.associate = function (models) {
    // associations can be defined here
    Project.hasMany(models.VotingQuery, {
      foreignKey: 'projectTitle'
    })
  };
  return Project;
};
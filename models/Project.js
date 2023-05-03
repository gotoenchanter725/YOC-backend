module.exports = (sequelize, DataTypes) => {
  const ProjectModel = sequelize.define('Project', {
    projectTitle: DataTypes.STRING,
    iconUrl: DataTypes.STRING,
    endDate: DataTypes.DATE,
    isDeleted: DataTypes.BOOLEAN, 
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
  };

  return ProjectModel;
};
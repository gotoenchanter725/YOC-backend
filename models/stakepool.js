module.exports = (sequelize, DataTypes) => {
    const StakePools = sequelize.define('StakePools', {
        poolId: DataTypes.INTEGER,
        address: DataTypes.STRING, 
        tokenAddress: DataTypes.STRING,
        tokenSymbol: DataTypes.STRING,
        tokenDecimals: DataTypes.INTEGER,
        allocPoint: DataTypes.INTEGER, 
        isYoc: DataTypes.BOOLEAN, 
        isFinished: {
            type: DataTypes.BOOLEAN, 
            defaultValue: false
        }, 

        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
    }, {});
    StakePools.associate = function (models) {
        // associations can be defined here
        // Project.belongsTo(models.User, {
        //     foreignKey: 'userId',
        //     onDelete: 'CASCADE'
        // })
        // StakePools.belongsTo(models.Project, { foreignKey: 'projectTitle' });
        // StakePools.hasMany(models.VotingDetail, { foreignKey: 'queryId' })
    };
    return StakePools;
};
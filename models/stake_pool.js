module.exports = (sequelize, DataTypes) => {
    const StakePool = sequelize.define('stake_pool', {
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
    StakePool.associate = function (models) {
        // associations can be defined here
        // Project.belongsTo(models.User, {
        //     foreignKey: 'userId',
        //     onDelete: 'CASCADE'
        // })
        // StakePool.belongsTo(models.Project, { foreignKey: 'projectTitle' });
        // StakePool.hasMany(models.VotingDetail, { foreignKey: 'queryId' })
    };
    return StakePool;
};
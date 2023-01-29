module.exports = (sequelize, DataTypes) => {
    const FarmsPools = sequelize.define('FarmsPools', {
        poolId: DataTypes.INTEGER,
        pairAddress: DataTypes.STRING, 
        pairDecimals: DataTypes.INTEGER, 
        pairSymbol: DataTypes.STRING, 
        isYoc: DataTypes.BOOLEAN, 
        allocPoint: DataTypes.INTEGER, 
        token0Address: DataTypes.STRING,
        token1Address: DataTypes.STRING,
        token0Symbol: DataTypes.STRING,
        token1Symbol: DataTypes.STRING,
        token0Decimals: DataTypes.INTEGER,
        token1Decimals: DataTypes.INTEGER,
        isFinished: {
            type: DataTypes.BOOLEAN, 
            defaultValue: false
        }, 

        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
    }, {});
    FarmsPools.associate = function (models) {
        // associations can be defined here
        // Project.belongsTo(models.User, {
        //     foreignKey: 'userId',
        //     onDelete: 'CASCADE'
        // })
        // FarmsPools.belongsTo(models.Project, { foreignKey: 'projectTitle' });
        // FarmsPools.hasMany(models.VotingDetail, { foreignKey: 'queryId' })
    };
    return FarmsPools;
};
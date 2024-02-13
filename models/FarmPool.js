module.exports = (sequelize, DataTypes) => {

    const FarmPoolModel = sequelize.define('FarmPool', {
        liquidityId: DataTypes.INTEGER,
        allocPoint: DataTypes.INTEGER,
        poolId: DataTypes.INTEGER,
        totalLPAmount: DataTypes.STRING,
        accYocPerShare: DataTypes.STRING,
        // pairAddress: DataTypes.STRING,
        // pairDecimals: DataTypes.INTEGER,
        // pairSymbol: DataTypes.STRING,
        // isYoc: DataTypes.BOOLEAN,
        // token0Address: DataTypes.STRING,
        // token1Address: DataTypes.STRING,
        // token0Symbol: DataTypes.STRING,
        // token1Symbol: DataTypes.STRING,
        // token0Decimals: DataTypes.INTEGER,
        // token1Decimals: DataTypes.INTEGER,
        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        isFinished: {
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
        tableName: 'farm_pools',
    });

    FarmPoolModel.associate = function (models) {
        FarmPoolModel.belongsTo(models.Liquidity, { as: 'liquidity', foreignKey: 'liquidityId' });
        FarmPoolModel.hasOne(models.FarmDetail, { foreignKey: 'farmId' });
    };
    return FarmPoolModel;
};
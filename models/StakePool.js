module.exports = (sequelize, DataTypes) => {
    const StakePoolModel = sequelize.define('StakePool', {
        poolId: DataTypes.INTEGER,
        address: DataTypes.STRING,
        // tokenAddress: DataTypes.STRING,
        // tokenSymbol: DataTypes.STRING,
        // tokenDecimals: DataTypes.INTEGER,
        // isYoc: DataTypes.BOOLEAN,
        token: DataTypes.INTEGER,
        allocPoint: DataTypes.INTEGER,
        totalShare: DataTypes.STRING,
        totalAmount: DataTypes.STRING,
        accYocPerShare: DataTypes.STRING,

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
        tableName: "stake_pools",
    });

    StakePoolModel.associate = function (models) {
        StakePoolModel.belongsTo(models.Currency, { as: 'currency', foreignKey: 'token' });
        StakePoolModel.hasOne(models.StakeDetail, { foreignKey: 'stakeId' });
    };

    return StakePoolModel;
};
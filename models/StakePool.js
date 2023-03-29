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

        isActive: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
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
    };

    return StakePoolModel;
};
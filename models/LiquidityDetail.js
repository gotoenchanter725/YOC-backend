module.exports = (sequelize, DataTypes) => {

    const LiquidityDetailModel = sequelize.define('LiquidityDetail', {
        liquidityId: DataTypes.INTEGER,
        userAddress: DataTypes.STRING, 
        allowance: DataTypes.BOOLEAN,
        amount: DataTypes.STRING, 
        isActive: {
          type: DataTypes.BOOLEAN,
          defaultValue: true
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
        tableName: 'liquidity_details', 
    });

    LiquidityDetailModel.associate = function (models) {
        LiquidityDetailModel.belongsTo(models.Liquidity, {as: 'liquidity', foreignKey: 'id'});
    };
    return LiquidityDetailModel;
};
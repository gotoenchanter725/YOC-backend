'use strict';

module.exports = (sequelize, DataTypes) => {
    const TradePriceModel = sequelize.define('TradePrice', {
        ptokenAddress: DataTypes.STRING,
        price: DataTypes.STRING,
        timestamp: DataTypes.STRING,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "trade_prices",
    });

    TradePriceModel.associate = function (models) {
        // associations can be defined here

        TradePriceModel.belongsTo(models.Project, { as: 'project', foreignKey: 'ptokenAddress', targetKey: 'ptokenAddress' })
    };

    return TradePriceModel;
};
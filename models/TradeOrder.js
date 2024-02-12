'use strict';

module.exports = (sequelize, DataTypes) => {
    const TradeOrderModel = sequelize.define('TradeOrder', {
        orderId: DataTypes.INTEGER,
        ptokenAddress: DataTypes.STRING,
        userAddress: DataTypes.STRING,
        price: DataTypes.STRING,
        totalAmount: DataTypes.STRING,
        remainingAmount: DataTypes.STRING,
        isCancelled: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isRemoved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        isBuy: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        transactionIds: DataTypes.STRING,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "trade_orders",
    });

    TradeOrderModel.associate = function (models) {
        // associations can be defined here

        TradeOrderModel.belongsTo(models.Project, { as: 'project', foreignKey: 'ptokenAddress', targetKey: 'ptokenAddress' })
    };

    return TradeOrderModel;
};
'use strict';

module.exports = (sequelize, DataTypes) => {
    const TradeTransactionModel = sequelize.define('TradeTransaction', {
        transactionId: DataTypes.INTEGER,
        amount: DataTypes.STRING,
        ptokenAddress: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        price: DataTypes.STRING,
        buyOrderId: DataTypes.STRING,
        sellOrderId: DataTypes.STRING,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "trade_transactions",
    });

    TradeTransactionModel.associate = function (models) {
        // associations can be defined here

        TradeTransactionModel.belongsTo(models.VotingQuery, { foreignKey: 'queryId' })
    };

    return TradeTransactionModel;
};
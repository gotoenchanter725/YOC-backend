'use strict';

module.exports = (sequelize, DataTypes) => {
    const VotingDetailModel = sequelize.define('VotingDetail', {
        queryId: DataTypes.INTEGER,
        userAddress: DataTypes.STRING,
        votingState: DataTypes.INTEGER,
        createdAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updatedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        tableName: "voting_details", 
    });

    VotingDetailModel.associate = function (models) {
        // associations can be defined here

        VotingDetailModel.belongsTo(models.VotingQuery, { foreignKey: 'queryId' })
    };

    return VotingDetailModel;
};
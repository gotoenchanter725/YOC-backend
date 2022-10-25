'use strict';

module.exports = (sequelize, DataTypes) => {
    const VotingDetail = sequelize.define('VotingDetail', {
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
    }, {});
    VotingDetail.associate = function (models) {
        // associations can be defined here

        VotingDetail.belongsTo(models.VotingQuery, { foreignKey: 'queryId' })
    };
    return VotingDetail;
};
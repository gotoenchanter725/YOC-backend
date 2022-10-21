'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    const VotingDetail = sequelize.define('VotingDetail', {
        projectTitle: DataTypes.STRING,
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

        VotingDetail.belongsTo(models.VotingQuery, {
            foreignKey: 'projectTitle'
        })
    };
    return VotingDetail;
};
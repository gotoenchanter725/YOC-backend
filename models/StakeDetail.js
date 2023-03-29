module.exports = (sequelize, DataTypes) => {

    const StakeDetailModel = sequelize.define('StakeDetail', {
        stakeId: DataTypes.INTEGER,
        tokenId: DataTypes.INTEGER,
        userAddress: DataTypes.STRING, 
        allowance: DataTypes.BOOLEAN,
        amount: DataTypes.STRING, 

        createdAt: {
            allowNull: false,
            type: DataTypes.DATE
        },
        updatedAt: {
            allowNull: false,
            type: DataTypes.DATE
        }
    }, {
        tableName: 'stake_details', 
    });

    StakeDetailModel.associate = function (models) {
    };
    return StakeDetailModel;
};
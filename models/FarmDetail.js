module.exports = (sequelize, DataTypes) => {

    const FarmDetailModel = sequelize.define('FarmDetail', {
        farmId: DataTypes.INTEGER,
        liquidityId: DataTypes.INTEGER,
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
        tableName: 'farm_details', 
    });

    FarmDetailModel.associate = function (models) {
    };
    return FarmDetailModel;
};
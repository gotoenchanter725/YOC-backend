module.exports = (sequelize, DataTypes) => {

    const FarmDetailModel = sequelize.define('FarmDetail', {
        farmId: DataTypes.INTEGER,
        liquidityId: DataTypes.INTEGER,
        userAddress: DataTypes.STRING, 
        allowance: DataTypes.INTEGER,
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
        FarmDetailModel.belongsTo(models.FarmPool, {as: 'farm', foreignKey: 'farmId'});
    };
    return FarmDetailModel;
};
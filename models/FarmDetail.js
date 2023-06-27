module.exports = (sequelize, DataTypes) => {

    const FarmDetailModel = sequelize.define('FarmDetail', {
        farmId: DataTypes.INTEGER,
        liquidityId: DataTypes.INTEGER,
        userAddress: DataTypes.STRING, 
        allowance: {
            type: DataTypes.STRING,
            defaultValue: "0"
        },
        amount: {
            type: DataTypes.STRING,
            defaultValue: "0"
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
        tableName: 'farm_details', 
    });

    FarmDetailModel.associate = function (models) {
        FarmDetailModel.belongsTo(models.FarmPool, {as: 'farm', foreignKey: 'farmId'});
    };
    return FarmDetailModel;
};
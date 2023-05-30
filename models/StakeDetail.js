module.exports = (sequelize, DataTypes) => {

    const StakeDetailModel = sequelize.define('StakeDetail', {
        stakeId: DataTypes.INTEGER,
        tokenId: DataTypes.INTEGER,
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
        tableName: 'stake_details',
    });

    StakeDetailModel.associate = function (models) {
        StakeDetailModel.belongsTo(models.StakePool, { as: 'stake', foreignKey: 'stakeId' });
    };
    return StakeDetailModel;
};
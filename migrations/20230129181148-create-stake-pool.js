'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('StakePools', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      poolId: {
        type: Sequelize.INTEGER
      },
      address: {
        type: Sequelize.STRING
      },
      tokenAddress: {
        type: Sequelize.STRING
      },
      tokenSymbol: {
        type: Sequelize.STRING
      },
      tokenDecimals: {
        type: Sequelize.INTEGER
      },
      allocPoint: {
        type: Sequelize.INTEGER
      },
      isYoc: {
        type: Sequelize.BOOLEAN
      },
      isFinished: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('StakePools');
  }
};
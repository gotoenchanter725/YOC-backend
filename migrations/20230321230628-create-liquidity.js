'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('liquidity', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      poolId: {
        type: Sequelize.INTEGER
      },
      pairAddress: {
        type: Sequelize.STRING
      },
      pairDecimals: {
        type: Sequelize.INTEGER
      },
      pairSymbol: {
        type: Sequelize.STRING
      },
      isYoc: {
        type: Sequelize.BOOLEAN
      },
      token0Address: {
        type: Sequelize.STRING
      },
      token1Address: {
        type: Sequelize.STRING
      },
      token0Symbol: {
        type: Sequelize.STRING
      },
      token1Symbol: {
        type: Sequelize.STRING
      },
      token0Decimals: {
        type: Sequelize.INTEGER
      },
      token1Decimals: {
        type: Sequelize.INTEGER
      },
      isActive: {
        type: Sequelize.BOOLEAN, 
        defaultValue: true
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
    await queryInterface.dropTable('liquidity');
  }
};
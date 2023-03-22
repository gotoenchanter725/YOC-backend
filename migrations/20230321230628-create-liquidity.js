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
      token0: {
        type: Sequelize.INTEGER
      },
      token1: {
        type: Sequelize.INTEGER
      },

      // liquidity information
      amount: { // LP amount
        type: Sequelize.STRING, 
        defaultValue: "0"
      },
      amount0: {
        type: Sequelize.STRING, 
        defaultValue: "0"
      },
      amount1: {
        type: Sequelize.STRING, 
        defaultValue: "0"
      },
      rate: {
        type: Sequelize.STRING, 
        defaultValue: ""
      }, 

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isDelete: {
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
    await queryInterface.dropTable('liquidity');
  }
};
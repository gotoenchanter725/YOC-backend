'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('stake_pools', {
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
      token: {
        type: Sequelize.INTEGER
      },
      allocPoint: {
        type: Sequelize.INTEGER
      },
      totalShare: {
        type: Sequelize.STRING
      },
      totalAmount: {
        type: Sequelize.STRING
      },
      accYocPerShare: {
        type: Sequelize.STRING
      },

      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
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
    await queryInterface.dropTable('stake_pools');
  }
};
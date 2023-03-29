'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farm_details', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      farmId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      liquidityId: {
        allowNull: false,
        type: Sequelize.INTEGER,
      },
      userAddress: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      allowance: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
      },
      amount: {
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('farm_details');
  }
};
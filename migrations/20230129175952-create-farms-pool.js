'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('farm_pools', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      poolId: {
        type: Sequelize.INTEGER
      },
      allocPoint: {
        type: Sequelize.INTEGER
      },

      isActive: {
        type: Sequelize.BOOLEAN, 
        defaultValue: false
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
    await queryInterface.dropTable('farm_pools');
  }
};
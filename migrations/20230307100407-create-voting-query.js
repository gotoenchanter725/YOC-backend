'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('voting_queries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projectTitle: {
        type: Sequelize.STRING
      },
      queryTitle: {
        type: Sequelize.STRING
      },
      queryContent: {
        type: Sequelize.STRING
      },
      amountAnswer: {
        type: Sequelize.INTEGER
      },
      answerStr: {
        type: Sequelize.STRING
      },
      totalResult: {
        type: Sequelize.STRING
      },
      votedWeight: {
        type: Sequelize.FLOAT
      },
      startDate: {
        type: Sequelize.DATE
      },
      endDate: {
        type: Sequelize.DATE
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('voting_queries');
  }
};
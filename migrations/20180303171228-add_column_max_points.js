'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addColumn(
          'Exercises',
          'max_points',
          {
              type: Sequelize.INTEGER,
              validate: {
                  isNumeric: true
              }
          }
      )
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeColumn('Exercises', 'max_points');
  }
};

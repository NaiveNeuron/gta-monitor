'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addIndex(
          'Posts',
          ['level'],
          {
              method: 'HASH',
              name: 'level'
          }
      );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeIndex('Posts', 'level');
  }
};

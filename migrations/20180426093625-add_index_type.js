'use strict';

module.exports = {
  up: (queryInterface, Sequelize) => {
      return queryInterface.addIndex(
          'Posts',
          ['type'],
          {
              method: 'HASH',
              name: 'type'
          }
      );
  },

  down: (queryInterface, Sequelize) => {
      return queryInterface.removeIndex('Posts', 'type');
  }
};

'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'Posts',
            'homedir',
            {
                type: Sequelize.STRING,
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('Posts', 'homedir');
    }
};

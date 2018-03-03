'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'Exercises',
            'last_level',
            {
                type: Sequelize.STRING,
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('Exercises', 'last_level');
    }
};

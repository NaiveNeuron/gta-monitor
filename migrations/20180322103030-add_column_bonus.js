'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.addColumn(
            'Evaluates',
            'bonus',
            {
                type: Sequelize.DOUBLE,
                defaultValue: 0
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.removeColumn('Posts', 'bonus');
    }
};

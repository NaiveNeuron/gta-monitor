'use strict';

module.exports = {
    up: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn(
            'Posts',
            'type',
            {
                type: Sequelize.ENUM('start', 'command', 'passed', 'exit', 'help', 'ack')
            }
        )
    },

    down: (queryInterface, Sequelize) => {
        return queryInterface.changeColumn(
            'Posts',
            'type',
            {
                type: Sequelize.ENUM('start', 'command', 'passed', 'exit')
            }
        )
    }
};

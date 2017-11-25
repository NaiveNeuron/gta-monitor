'use strict';

var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    var Exercise = sequelize.define('Exercise', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: Sequelize.INTEGER
        },

        number: {
            type: Sequelize.INTEGER,
            notEmpty: true
        },

        name: {
            type: Sequelize.STRING,
        },

        starts_at: {
            type: Sequelize.DATE,
            notEmpty: true
        },

        ends_at: {
            type: Sequelize.DATE,
            notEmpty: true
        },

        status: {
            type: Sequelize.ENUM('scheduled', 'active', 'done'),
            defaultValue: 'scheduled'
        }
    });

    return Exercise;
};

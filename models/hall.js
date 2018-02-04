'use strict';

module.exports = function(sequelize, DataTypes) {
    var Hall = sequelize.define('Hall', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        positions: {
            type: DataTypes.JSON
        }
    });

    return Hall;
};

'use strict';

module.exports = function(sequelize, DataTypes) {
    var Alternative = sequelize.define('Alternative', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        user: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },

        alternative: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },
    });

    return Alternative;
};

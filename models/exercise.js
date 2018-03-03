'use strict';

module.exports = function(sequelize, DataTypes) {
    var Exercise = sequelize.define('Exercise', {
        id: {
            autoIncrement: false,
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            validate: {
                isNumeric: true
            }
        },

        name: {
            type: DataTypes.STRING,
        },

        last_level: {
            type: DataTypes.STRING,
        },

        max_points: {
            type: DataTypes.DOUBLE,
            validate: {
                isNumeric: true
            }
        },

        starts_at: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },

        ends_at: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },

        status: {
            type: DataTypes.ENUM('scheduled', 'active', 'done'),
            defaultValue: 'scheduled'
        }
    });

    Exercise.associate = function(models) {
        Exercise.hasMany(models.Post, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
        Exercise.hasMany(models.Evaluate, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
    };

    return Exercise;
};

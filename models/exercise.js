'use strict';

module.exports = function(sequelize, DataTypes) {
    var Exercise = sequelize.define('Exercise', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        number: {
            type: DataTypes.INTEGER,
            unique: true,
            allowNull: false,
            validate: {
                isNumeric: true
            }
        },

        name: {
            type: DataTypes.STRING,
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
    };

    return Exercise;
};

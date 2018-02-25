'use strict';

module.exports = function(sequelize, DataTypes) {
    var Evaluate = sequelize.define('Evaluate', {
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

        score: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },

        comment: {
            type: DataTypes.TEXT
        }
    });

    Evaluate.associate = function(models) {
        Evaluate.belongsTo(models.Exercise, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
        Evaluate.belongsTo(models.User, {foreignKey: 'user_id', onDelete: 'SET NULL'});
    };

    return Evaluate;
};

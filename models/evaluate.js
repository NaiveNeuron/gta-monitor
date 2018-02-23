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
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        }
    });

    Evaluate.associate = function(models) {
        Evaluate.belongsTo(models.Exercise, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
    };

    return Evaluate;
};

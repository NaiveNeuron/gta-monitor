'use strict';

module.exports = function(sequelize, DataTypes) {
    var Pointmap = sequelize.define('Pointmap', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        level: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },

        points: {
            type: DataTypes.DOUBLE,
            allowNull: false,
            validate: {
                isDecimal: true
            }
        },

        is_bonus: {
            type: DataTypes.BOOLEAN,
            defaultValue: 0
        }
    });

    Pointmap.associate = function(models) {
        Pointmap.belongsTo(models.Exercise, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
    };

    return Pointmap;
};

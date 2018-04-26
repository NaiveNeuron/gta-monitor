'use strict';

var Exercise = require('../models').Exercise;

module.exports = function(sequelize, DataTypes) {
    var Post = sequelize.define('Post', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        type: {
            type: DataTypes.ENUM('start', 'command', 'passed', 'exit', 'help', 'ack'),
            defaultValue: 'command'
        },

        date: {
            type: DataTypes.DATE,
            allowNull: false,
            validate: {
                isDate: true
            }
        },

        user: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },

        hostname: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: true,
            }
        },

        ip: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isIPv4: true
            }
        },

        level: {
            type: DataTypes.STRING,
        },

        command: {
            type: DataTypes.TEXT
        },

        hash: {
            type: DataTypes.STRING
        },

        homedir: {
            type: DataTypes.STRING
        }
    },
    {
        indexes: [
            {
                name: 'level',
                method: 'HASH',
                fields: ['level']
            },
            {
                name: 'type',
                method: 'HASH',
                fields: ['type']
            }
        ]
    });

    Post.associate = function(models) {
        Post.belongsTo(models.Exercise, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
    };

    return Post;
};

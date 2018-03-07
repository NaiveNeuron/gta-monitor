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
            type: DataTypes.ENUM('start', 'command', 'passed', 'exit'),
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
        },

        /*indexes: [
            {
                name: 'post_index',
                method: 'HASH',
                fields: ['exercise_id', {attribute: 'title', collate: 'en_US', order: 'DESC', length: 5}]
            }
        ]*/
    });

    Post.associate = function(models) {
        Post.belongsTo(models.Exercise, {foreignKey: 'exercise_id', onDelete: 'CASCADE'});
    };

    return Post;
};

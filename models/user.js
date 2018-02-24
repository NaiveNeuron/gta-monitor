'use strict';

var bcrypt = require('bcrypt-nodejs');


function crypt_password(password)
{
    return new Promise(function(resolve, reject) {
        bcrypt.hash(password, null, null, function(err, hash) {
            if (err)
                return reject(err);
            return resolve(hash);
        });
    });
}

module.exports = function(sequelize, DataTypes) {
    var User = sequelize.define('User', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },

        firstname: {
            type: DataTypes.STRING,
        },

        lastname: {
            type: DataTypes.STRING,
        },

        username: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: true
            }
        },

        about: {
            type: DataTypes.TEXT,
            validate: {
                notEmpty: true
            }
        },

        email: {
            type: DataTypes.STRING,
            validate: {
                isEmail: true
            }
        },

        password: {
            type: DataTypes.STRING,
            allowNull: false
        },

        last_login: {
            type: DataTypes.DATE
        },

        status: {
            type: DataTypes.ENUM('active', 'inactive'),
            defaultValue: 'active'
        }
    });

    User.beforeCreate(function(user, options) {
        return crypt_password(user.password).then(function(hash) {
            user.password = hash;
        }).catch(function(err) {
            if (err) console.log(err);
        });
    });

    User.associate = function(models) {
        User.hasMany(models.Evaluate, {foreignKey: 'user_id', onDelete: 'SET NULL'});
    };

    return User;
};

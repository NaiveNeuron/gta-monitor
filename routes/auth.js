var express = require('express');
var passport = require('passport');
var bcrypt = require('bcrypt-nodejs');
var models = require('../models');
var router = express.Router();

router.get('/login', function(req, res, next) {
    res.render('login', { header: 'Login' });
});

router.post('/login',
            passport.authenticate('local', { successRedirect: '/',
                                             failureRedirect: '/auth/login',
                                             failureFlash: true })
);

router.get('/signup', function(req, res, next) {
    res.render('signup', { header: 'Signup' });
});

router.post('/signup', function(req, res, next) {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var username = req.body.username;
    var pwd = req.body.password;
    var pwd_again = req.body.password_again;

    if (pwd != pwd_again) {
        res.render('signup', { header: 'Signup', error: 'Passwords do not match!'});
        return;
    }

    models.User.findOne({
        where: {
            username: username,
        }
    }).then(function(user) {
        if (user) {
            res.render('signup', { header: 'Signup', error: 'User already exists!'});
            return;
        }

        models.User.create(
            { username: username,
              password: pwd,
              firstname: firstname,
              lastname: lastname }).then(function(user) {
            req.flash('success', 'User ' + user.username + ' created');
            res.redirect('/');
        });
    });
});

module.exports = router;

var express = require('express');
var sequelize = require('sequelize');
var models = require('../models');
var socketapi = require('../socketapi');
var login_required = require('./middlewares').login_required;
var router = express.Router();

router.get('/create', login_required, function(req, res, next) {
    res.render('create_exercise', { header: 'Create Exercise' });
});

function validate_exercise(req)
{
    req.checkBody('number', 'The number of the exercise required').notEmpty();
    req.checkBody('starts_at', 'The date and time of exercise start required').notEmpty();
    req.checkBody('ends_at', 'The date and time of exercise finish required').notEmpty();

    req.sanitize('name').escape();
    req.sanitize('name').trim();

    return req;
}

router.post('/create', login_required, function(req, res, next) {
    req = validate_exercise(req);

    var errors = req.validationErrors();

    if (errors) {
        res.render('create_exercise', { header: 'Create Exercise', errors: errors});
        return;
    } else {
        var data = {name: req.body.name, number: req.body.number,
                    starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at};
        models.Exercise.create(data).then(function(exercise) {
            models.Exercise.findAll().then(function(resultset) {
                req.app.locals.navbar_exercises = resultset;

                var data = exercise.dataValues;
                var msg = 'Exercise ' + data.name + ' #' + data.number + ' created';
                req.flash('success', msg);
                res.redirect('/');
            });
        });
    }
});

router.get('/edit/:exercise_id', login_required, function(req, res, next) {
    models.Exercise.findOne({
        where: {
            id: req.params.exercise_id,
        }
    }).then(function(exercise) {
        if (!exercise)
            next();

        res.render('edit_exercise', {header: 'Edit Exercise', exercise: exercise});
    });
});

router.post('/edit/:exercise_id', login_required, function(req, res, next) {
    req = validate_exercise(req);

    var errors = req.validationErrors();

    if (errors) {
        res.render('create_exercise', { header: 'Create Exercise', errors: errors});
        return;
    } else {
        var data = {name: req.body.name, number: req.body.number,
                    status: req.body.status, starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at};
        models.Exercise.update(data, {
            where: {
                id: req.params.exercise_id
            }
        }).then(function(exercise) {
            models.Exercise.findAll().then(function(resultset) {
                req.app.locals.navbar_exercises = resultset;

                var msg = 'Exercise ' + data.name + ' #' + data.number + ' updated';
                req.flash('success', msg);
                res.redirect('/');
            });
        });
    }
});

router.get('/active', login_required, function(req, res, next) {
    models.Exercise.findOne({
        where: {
            status: 'active',
        }
    }).then(function(exercise) {
        res.render('active_exercise', {header: 'Active Exercise', exercise: exercise});
    });
});

/* if this event is called, active exercise exists */
socketapi.io.on('connect', function(socket) {
    models.Exercise.findOne({
        where: {
            status: 'active',
        },
        attributes: ['id']
    }).then(function(exercise) {
        models.Post.findAll({
            where: {
                exercise_id: exercise.id
            }
        }).then(function(resultset){
            socket.emit('load_active_exercise', resultset, global.inactive);
        });
    });
});

module.exports = router;

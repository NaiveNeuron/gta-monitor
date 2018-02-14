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
    req.checkBody('id', 'The id of the exercise required').notEmpty();
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
        var data = {name: req.body.name, id: req.body.id,
                    starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at};
        models.Exercise.create(data).then(function(exercise) {
            models.Exercise.findAll().then(function(resultset) {
                req.app.locals.navbar_exercises = resultset;

                var data = exercise.dataValues;
                var msg = 'Exercise ' + data.name + ' #' + data.id + ' created';
                req.flash('success', msg);
                res.redirect('/');
            });
        }).catch(function(err) {
            res.render('create_exercise', { header: 'Create Exercise',
                                            errors: [ {msg: 'Something went wrong with database (check exercise ID is unique)'} ]});
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
        models.Exercise.findOne({
            where: {
                id: req.params.exercise_id,
            }
        }).then(function(exercise) {
            res.render('edit_exercise', { header: 'Edit Exercise', exercise: exercise, errors: errors});
            return;
        });
    } else {
        var data = {name: req.body.name, id: req.body.id,
                    status: req.body.status, starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at};
        models.Exercise.update(data, {
            where: {
                id: req.params.exercise_id
            }
        }).then(function(exercise) {
            models.Exercise.findAll().then(function(resultset) {
                req.app.locals.navbar_exercises = resultset;

                var msg = 'Exercise ' + data.name + ' #' + data.id + ' updated';
                req.flash('success', msg);
                res.redirect('/');
            });
        }).catch(function(err) {
            models.Exercise.findOne({
                where: {
                    id: req.params.exercise_id,
                }
            }).then(function(exercise) {
                res.render('edit_exercise', { header: 'Edit Exercise',
                                              exercise: exercise,
                                              errors: [ {msg: 'Something went wrong with database (check exercise ID is unique)'} ]});
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
        models.Hall.findOne({
            where: {
                user_id: req.user.id
            }
        }).then(function(hall) {
            if (!hall)
                hall = {};
            else
                hall = hall.positions;
            res.render('active_exercise', {header: 'Active Exercise', exercise: exercise, hall: JSON.stringify(hall)});
        });
    });
});

router.post('/active/save', login_required, function(req, res, next) {
    models.Hall.findOne({
        where: {
            user_id: req.user.id
        }
    }).then(function(hall) {
        if (hall) {
            models.Hall.update({positions: req.body}, {
                where: {
                    user_id: req.user.id
                }
            }).then(function(hall) {
                res.json({success : 'Updated Successfully', status : 200});
            });
        } else {
            models.Hall.create({user_id: req.user.id, positions: req.body}).then(function(hall) {
                res.json({success : 'Created Successfully', status : 200});
            });
        }
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

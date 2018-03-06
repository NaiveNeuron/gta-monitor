var express = require('express');
var sequelize = require('sequelize');
var json2csv = require('json2csv').parse;
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

    req.sanitize('last_level').escape();
    req.sanitize('last_level').trim();

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
                    last_level: req.body.last_level,
                    max_points: req.body.max_points,
                    starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at,};
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
                    last_level: req.body.last_level,
                    max_points: req.body.max_points,
                    status: req.body.status, starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at};
        models.Exercise.update(data, {
            where: {
                id: req.params.exercise_id
            }
        }).then(function(exercise) {
            models.Exercise.findAll().then(function(resultset) {
                req.app.locals.navbar_exercises = resultset;
                req.app.locals.navbar_evaluate_exercises = [];
                resultset.forEach(function(item) {
                    if (item.status == 'done')
                        req.app.locals.navbar_evaluate_exercises.push(item);
                });

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
                hall = "{}";
            else
                hall = hall.positions;
            res.render('active_exercise', {header: 'Active Exercise', exercise: exercise, hall: hall});
        });
    });
});

router.post('/active/save', login_required, function(req, res, next) {
    var data = JSON.stringify(req.body);
    models.Hall.findOne({
        where: {
            user_id: req.user.id
        }
    }).then(function(hall) {
        if (hall) {
            models.Hall.update({positions: data}, {
                where: {
                    user_id: req.user.id
                }
            }).then(function(hall) {
                res.json({success : 'Updated Successfully', status : 200});
            });
        } else {
            models.Hall.create({user_id: req.user.id, positions: data}).then(function(hall) {
                res.json({success : 'Created Successfully', status : 200});
            });
        }
    });
});

router.get('/evaluate/:exercise_id', login_required, function(req, res, next) {
    models.Exercise.findById(req.params.exercise_id).then(function(exercise) {
        models.Post.findAll({
            where: {
                exercise_id: exercise.id
            }
        }).then(function(resultset_posts) {
            models.Evaluate.findAll({
                where: {
                    exercise_id: exercise.id
                }
            }).then(function(resultset_evals) {
                var posts = resultset_posts.map(function(post) { return post.dataValues; });
                var evals = resultset_evals.map(function(eval) { return eval.dataValues; });
                res.render('evaluate_exercise', { header: 'Evaluate Exercise',
                                                  modal_evaluate: true,
                                                  exercise: exercise,
                                                  posts: JSON.stringify(posts),
                                                  evals: JSON.stringify(evals)});
            });
        });
    });
});

router.post('/evaluate/:exercise_id', login_required, function(req, res, next) {
    var user = req.body.user;
    var score = req.body.score;
    var comment = req.body.comment;
    var exercise_id = req.params.exercise_id;
    var user_id = req.user.id;

    models.Evaluate.findOne({
        where: {
            exercise_id: exercise_id,
            user: user
        }
    }).then(function(evaluation) {
        if (evaluation) {
            evaluation.update({user_id: user_id, score: score, comment: comment}).then(function() {
                res.status(200).send({success: "Updated successfully"});
            });
        } else {
            models.Evaluate.create({
                user: user,
                score: score,
                comment: comment,
                exercise_id: exercise_id,
                user_id: user_id
            }).then(function(ev) {
                res.status(200).send({success: "Created successfully"});
            });
        }
    }).catch(function(err) {
        res.status(err.code).send({fail: err.message});
    });
});

router.get('/evaluate/:exercise_id/csvexport', login_required, function(req, res, next) {
    var fields = ['username', 'grade', 'comment'];

    models.Evaluate.findAll({
        where: {
            exercise_id: req.params.exercise_id
        },
        attributes: [['user', 'username'], ['score', 'grade'], 'comment']
    }).then(function(resultset) {
        var data = resultset.map(function(ev) { return ev.toJSON(); })

        var csv = json2csv(data, { fields, quote: '' });
        res.attachment('score.csv');
        res.status(200).send(csv);
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
        if (exercise) {
            models.Post.findAll({
                where: {
                    exercise_id: exercise.id
                }
            }).then(function(resultset){
                socket.emit('load_active_exercise', resultset, global.inactive);
            });
        }
    });
});

module.exports = router;

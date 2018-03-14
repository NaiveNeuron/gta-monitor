var express = require('express');
var sequelize = require('sequelize');
var md5 = require('md5');
var json2csv = require('json2csv').parse;
var models = require('../models');
var socketapi = require('../socketapi');
var login_required = require('./middlewares').login_required;
var router = express.Router();

function get_md5_hash(challenge_name, level, homedir)
{
    return md5('i' + challenge_name + 'j%!d(string=' + level + ')k' + homedir + 'l');
}

function my_evaluate_upsert(values, condition)
{
    return models.Evaluate
        .findOne({ where: condition })
        .then(function(obj) {
            if(obj) {
                return obj.update(values);
            }
            else {
                return models.Evaluate.create(values);
            }
        });
}

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

router.get('/create', login_required, function(req, res, next) {
    res.render('create_exercise', { header: 'Create Exercise' });
});

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
            res.render('active_exercise', {header: 'Active Exercise', exercise: exercise,
                                           hall: hall, inactivity_time: global.inactivity});
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
                res.json({success : true, message: 'Updated Successfully', status : 200});
            });
        } else {
            models.Hall.create({user_id: req.user.id, positions: data}).then(function(hall) {
                res.json({success : true, message: 'Created Successfully', status : 200});
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

        if (data.length == 0) {
            return res.status(204).send();
        }

        var csv = json2csv(data, { fields, quote: '' });
        res.attachment('score.csv');
        res.status(200).send(csv);
    });
});

router.post('/evaluate/:exercise_id/auto', login_required, function(req, res, next) {
    models.Exercise.findOne({
        where: {
            id: req.params.exercise_id
        }
    }).then(function(exercise) {
        if (!exercise || !exercise.max_points)
            return res.status(404).send();

        models.Post.findAll({
            where: {
                exercise_id: exercise.id,
                type: global.POST_EXIT
            }
        }).then(function(resultset) {
            var grades = {};
            resultset.forEach(function(item) {
                var success_hash = get_md5_hash(exercise.name, exercise.last_level, item.homedir)
                var users_hash = item.hash;

                if (success_hash == users_hash)
                    grades[item.user] = exercise.max_points;
                else if (item.user in grades)
                    delete grades[item.user];
            });

            var promises = [];
            for (user in grades) {
                promises.push(my_evaluate_upsert({user: user, score: grades[user],
                                                  exercise_id: exercise.id, user_id: req.user.id},
                                                  {user: user, exercise_id: exercise.id}));
            }

            Promise.all(promises).then(function(result) {
                var results = result.map(function(r) { return {user: r.user, score: r.score}});
                res.json({success : true, message: 'Evaluated Successfully',
                          status : 200, data: results});
            }).catch(function(err) {
                res.json({success : true, message: err, status : 500});
            });
        });
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
                socket.emit('load_active_exercise', resultset);
            });
        }
    });
});

module.exports = router;

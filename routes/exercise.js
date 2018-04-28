var express = require('express');
var sequelize = require('sequelize');
var json2csv = require('json2csv').parse;
var models = require('../models');
var socketapi = require('../socketapi');
var login_required = require('./middlewares').login_required;

var helpers = require('../helpers/helpers');
var shell_parse = require('shell-quote').parse;

var env = process.env.NODE_ENV || 'development';
var app_config = require('../config/app_config.json')[env];

var router = express.Router();

function my_upsert(model, values, condition)
{
    return model
        .findOne({ where: condition })
        .then(function(obj) {
            if(obj)
                return obj.update(values);
            else
                return model.create(values);
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
                    starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at,};
        models.Exercise.create(data).then(function(exercise) {
            models.Pointmap.bulkCreate(helpers.get_point_mapping(req.body.pointmap, exercise.id)).then(function() {
                models.Exercise.findAll().then(function(resultset) {
                    req.app.locals.navbar_exercises = resultset;

                    var data = exercise.dataValues;
                    var msg = 'Exercise ' + data.name + ' #' + data.id + ' created';
                    req.flash('success', msg);
                    res.redirect('/');
                });
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

        models.Pointmap.findAll({
            where: {
                exercise_id: exercise.id
            }
        }).then(function(pointmaps){
            res.render('edit_exercise', {header: 'Edit Exercise', exercise: exercise,
                                         pointmaps: pointmaps});
        });
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
                    status: req.body.status, starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at};
        models.Exercise.update(data, {
            where: {
                id: req.params.exercise_id
            }
        }).then(function(exercise) {
            models.Pointmap.findAll({
                where: {
                    exercise_id: req.params.exercise_id
                }
            }).then(function(pointmaps) {
                var promises = [];
                var levels = [];
                var mapping = [];
                if (req.body.pointmap) {
                    levels = req.body.pointmap.levels;
                    mapping = helpers.get_point_mapping(req.body.pointmap, req.params.exercise_id);
                }
                for (var i = 0; i < pointmaps.length; i++) {
                    if (!(levels.indexOf(pointmaps[i].level) > -1))
                        promises.push(pointmaps[i].destroy());
                }
                for (var i = 0; i < mapping.length; i++) {
                    promises.push(my_upsert(models.Pointmap, mapping[i],
                                           {exercise_id: req.params.exercise_id, level: mapping[i].level}));
                }

                Promise.all(promises).then(function(result) {
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
                });
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
        models.Pointmap.findAll({
            where: {
                exercise_id: exercise.id
            }
        }).then(function(resultset_pointmaps) {
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
                    models.Alternative.findAll({
                        attributes: ['user', 'alternative']
                    }).then(function(resultset_alters){
                        var posts = resultset_posts.map(function(post) { return post.dataValues; });
                        var evals = resultset_evals.map(function(eval) { return eval.dataValues; });
                        var alters = resultset_alters.map(function(alter) { return alter.dataValues; });
                        res.render('evaluate_exercise', { header: 'Evaluate Exercise',
                                                          modal_evaluate: true,
                                                          auto_evaluate: resultset_pointmaps.length ? true : false,
                                                          exercise: exercise,
                                                          posts: JSON.stringify(posts),
                                                          evals: JSON.stringify(evals),
                                                          alternatives: JSON.stringify(alters)});
                    });
                });
            });
        });
    });
});

router.post('/evaluate/:exercise_id', login_required, function(req, res, next) {
    var user = req.body.user;
    var score = req.body.score;
    var bonus = req.body.bonus;
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
            evaluation.update({
                user_id: user_id,
                score: score,
                bonus: bonus == '' ? 0 : bonus,
                comment: comment
            }).then(function() {
                return res.json({message: 'Updated Successfully', status : 200});
            }).catch(function(err) {
                return res.status(500).json({message: err.errors[0].message, status: 500});
            });
        } else {
            models.Evaluate.create({
                user: user,
                score: score,
                bonus: bonus == '' ? 0 : bonus,
                comment: comment,
                exercise_id: exercise_id,
                user_id: user_id
            }).then(function(ev) {
                return res.json({message: 'Created Successfully', status : 200});
            }).catch(function(err) {
                return res.status(500).json({message: err.errors[0].message, status: 500});
            });
        }
    }).catch(function(err) {
        return res.status(500).json({message: 'Failed to save', status : err.code});
    });
});

router.get('/evaluate/:exercise_id/csvexport', login_required, function(req, res, next) {
    var fields = ['username', 'grade', 'bonus', 'comment'];

    models.Evaluate.findAll({
        where: {
            exercise_id: req.params.exercise_id
        },
        attributes: [['user', 'username'], ['score', 'grade'], 'bonus', 'comment']
    }).then(function(resultset) {
        models.Alternative.findAll({
            attributes: ['user', 'alternative']
        }).then(function(resultset_alters) {
            var alters = {};
            for (var i = 0; i < resultset_alters.length; i++) {
                alters[resultset_alters[i].user] = resultset_alters[i].alternative;
            }

            var data = resultset.reduce(function(result, ev) {
                ev = ev.get({ plain: true });
                if (ev.username in alters)
                    ev.username = alters[ev.username];

                if (ev.username != global.EXCLUDE_NAME)
                    result.push(ev);

                return result;
            }, []);

            if (data.length == 0) {
                return res.status(204).send();
            }

            var csv = json2csv(data, { fields, quote: '' });
            res.attachment('score.csv');
            res.status(200).send(csv);
        });
    });
});

router.post('/evaluate/:exercise_id/auto', login_required, function(req, res, next) {
    models.Exercise.findOne({
        where: {
            id: req.params.exercise_id
        }
    }).then(function(exercise) {
        if (!exercise)
            return res.status(404).send();

        models.Pointmap.findAll({
            where: {
                exercise_id: exercise.id
            }
        }).then(function(pointmaps) {
            models.Post.findAll({
                where: {
                    exercise_id: exercise.id,
                    type: {
                        [sequelize.Op.or]: [global.POST_PASSED, global.POST_EXIT, global.POST_START]
                    }
                }
            }).then(function(resultset) {
                var grades = {};
                var regexps = pointmaps.map(function(pm) { return new RegExp(pm.level); });
                for (var i = resultset.length - 1; i >= 0; i--) {
                    var item = resultset[i];

                    if ((item.type == global.POST_EXIT || item.type == global.POST_START) && item.user in grades) {
                        grades[item.user].exit = true;
                        continue;
                    }

                    /* if we already saw user who exited, do not add more points */
                    if (item.user in grades && grades[item.user].exit)
                        continue;

                    /* check pointmap for each passed post */
                    for (var j = pointmaps.length - 1; j >= 0; j--) {
                        var pm = pointmaps[j];

                        /* if the level doesnt match the pointmap regexp, continue*/
                        if (!regexps[j].test(item.level))
                            continue;

                        var success_hash = helpers.get_md5_hash(exercise.name, item.level, item.homedir);

                        if (success_hash == item.hash) {
                            var bonus = 0;
                            var score = 0;
                            if (pm.is_bonus)
                                bonus = pm.points;
                            else
                                score = pm.points;

                            if (item.user in grades) {
                                grades[item.user].score += score;
                                grades[item.user].bonus += bonus;
                            } else {
                                grades[item.user] = {score: score, bonus: bonus, exit: false};
                            }
                            break;
                        }
                    }
                }

                var promises = [];
                for (user in grades) {
                    promises.push(my_upsert(models.Evaluate,
                                            {user: user, score: grades[user].score,
                                             bonus: grades[user].bonus,
                                             exercise_id: exercise.id, user_id: req.user.id},
                                            {user: user, exercise_id: exercise.id}));
                }

                Promise.all(promises).then(function(result) {
                    var results = result.map(function(r) { return {user: r.user, score: r.score, bonus: r.bonus}});
                    res.json({success: true, message: 'Evaluated Successfully',
                              status: 200, data: results});
                }).catch(function(err) {
                    return res.status(500).json({message: err.errors[0].message, status: 500});
                });
            });
        });
    });
});

router.get('/statistics/:exercise_id', login_required, function(req, res, next) {
    models.Exercise.findById(req.params.exercise_id).then(function(exercise) {
        models.Post.findAll({
            where: {
                exercise_id: exercise.id
            }
        }).then(function(resultset_posts) {
            var posts = resultset_posts.map(function(post) { return post.dataValues; });
            res.render('statistics_exercise', { header: 'Exercise statistics',
                                                exercise: exercise,
                                                posts: JSON.stringify(posts)});
        });
    });
});

router.get('/statistics/:exercise_id/:level', login_required, function(req, res, next) {
    var k = req.param('k', 3);
    var dist_function = req.param('distance', 'jaccard');
    var input_repr = req.param('representation', 'unigrams');

    models.Exercise.findById(req.params.exercise_id).then(function(exercise) {
        models.Post.findAll({
            where: {
                type: global.POST_PASSED,
                exercise_id: exercise.id,
                level: {
                    [sequelize.Op.like]: req.params.level + '%'
                }
            }
        }).then(function(resultset_posts) {
            var all_words = new Set();
            var set_commands = resultset_posts.map(function(c) {
                c = c.get({plain: true});

                var p = shell_parse(c.command);
                var words = new Set();
                var prev_cmd = null;
                var separator = true;

                for (var i = 0; i < p.length; i++) {
                    separator = false;
                    if (typeof(p[i]) === 'object') {
                        p[i] = p[i].op;
                        separator = true;
                        prev_cmd = null;
                    }

                    switch(input_repr) {
                        case 'unigrams':
                            word = p[i];
                            break;
                        case 'bigrams':
                            if (separator) {
                                word = p[i];
                            } else if (!separator && prev_cmd == null) {
                                word = p[i];
                                prev_cmd = word;
                            } else {
                                word = prev_cmd + ' ' + p[i];
                            }
                            break;
                    }
                    words.add(word);
                    all_words.add(word);
                }

                var date = new Date(c.date);
                c.date = helpers.pad(date.getHours()) + ':'
                       + helpers.pad(date.getMinutes()) + ':'
                       + helpers.pad(date.getSeconds());
                c.words = Array.from(words);
                return c;
            });

            all_words = Array.from(all_words);
            set_commads = set_commands.map(function(c) {
                c.vector = [];
                for (var i = 0; i < all_words.length; i++) {
                    c.vector.push(
                        c.words.indexOf(all_words[i]) > -1 ? 1 : 0
                    )
                }
                return c;
            });

            helpers.compute_kmeans(set_commands, k, dist_function, function(err, result) {
                if (err) {
                    console.error(err);
                    return res.render('statistics_kmeans', { header: 'k-means clustering - ' + dist_function + ' distance - ' + input_repr,
                                                             error: 'The number of points must be greater than the number k of clusters',
                                                             k: k,
                                                             string_clusters: JSON.stringify([])});
                }

                var clusters = [];
                var vectors = [];
                for (var i = 0; i < result.length; i++) {
                    var item = result[i];
                    var cluster = {centroid: item.centroid.join(', '), items: [], id: i};
                    for (var j = 0; j < item.clusterInd.length; j++) {
                        cluster.items.push({user: set_commands[item.clusterInd[j]].user,
                                            hostname: set_commands[item.clusterInd[j]].hostname,
                                            date: set_commands[item.clusterInd[j]].date,
                                            command: set_commands[item.clusterInd[j]].command,
                                            vector: set_commands[item.clusterInd[j]].vector,
                        });
                        vectors.push(set_commands[item.clusterInd[j]].vector);
                    }
                    clusters.push(cluster);
                }

                var dist_matrix = [];
                var distance = helpers.get_distance_function(dist_function);
                for (var i = 0; i < vectors.length; i++) {
                    dist_matrix.push([]);
                    for (var j = 0; j < vectors.length; j++) {
                        if (i != j)
                            dist_matrix[i].push(distance(vectors[i], vectors[j]));
                        else
                            dist_matrix[i].push(0);
                    }
                }

                res.render('statistics_kmeans', { header: 'k-means clustering - ' + dist_function + ' distance - ' + input_repr,
                                                  clusters: clusters,
                                                  all_words: all_words,
                                                  k: k,
                                                  dist_matrix: JSON.stringify(dist_matrix),
                                                  string_clusters: JSON.stringify(clusters)});
            });
        });
    });
});

router.post('/evaluate/alternative/set', login_required, function(req, res, next) {
    var user = req.body.user;
    var alternative = req.body.alternative;

    if (alternative == '') {
        models.Alternative.findOne({
            where: {
                user: user
            }
        }).then(function(alter) {
            alter.destroy();
        }).then(function() {
            res.json({success : true, message: 'Destroyed Successfully', status : 200})
        }).catch(function(err) {
            res.json({success : false, message: err, status : 500})
        });
    } else {
        my_upsert(models.Alternative,
                  {user: user, alternative: alternative},
                  {user: user}).then(function(result) {
            res.json({success : true, message: 'Updated Successfully', status : 200})
        }).catch(function(err) {
            res.json({success : false, message: err, status : 500})
        });
    }
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
                models.Alternative.findAll({
                    attributes: ['user', 'alternative']
                }).then(function(alternatives) {
                    socket.emit('load_active_exercise', resultset, alternatives);
                });
            });
        }
    });
});

module.exports = router;

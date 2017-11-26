var express = require('express');
var models = require('../models');
var router = express.Router();

router.get('/create', function(req, res, next) {
    res.render('create_exercise', { header: 'Create Exercise' });
});

router.post('/create', function(req, res, next) {
    req.checkBody('number', 'The number of the exercise required').notEmpty();
    req.checkBody('starts_at', 'The date and time of exercise start required').notEmpty();
    req.checkBody('ends_at', 'The date and time of exercise finish required').notEmpty();

    req.sanitize('name').escape();
    req.sanitize('name').trim();

    var errors = req.validationErrors();

    if (errors) {
        res.render('create_exercise', { header: 'Create Exercise', errors: errors});
        return;
    } else {
        var data = {name: req.body.name, number: req.body.number,
                    starts_at: req.body.starts_at,
                    ends_at: req.body.ends_at}
        models.Exercise.create(data).then(function(exercise) {
                                              res.redirect('/');
                                          });
    }
});

module.exports = router;

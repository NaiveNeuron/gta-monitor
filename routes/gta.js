var express = require('express');
var router = express.Router();

var models = require('../models');

/* POST from GTA application. */
router.post('/', function(req, res, next) {
    console.log('GOT POST');
    console.log(req.body);

    var d = req.body;
    models.Exercise.findAll({
        where: {
            status: 'active',
            number: d.exercise_number
        }
    }).then(function(resultset) {
        /* if exercise matches the query, the resultset should contain one item */
        resultset.forEach(function(item) {
            var ex = item.get({plain: true});
            var dt = new Date(0);
            dt.setUTCSeconds(d.date);

            var data = {type: d.type, date: dt, user: d.user,
                        hostname: d.hostname, ip: d.ip, exercise_id: ex.id};
            if (d.type == 'command' || d.type == 'passed') {
                data.command = d.command;
                data.level = d.level;
            }
            models.Post.create(data);
        });
    });

    res.status(200).send();
});

module.exports = router;

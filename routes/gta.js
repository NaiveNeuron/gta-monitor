var express = require('express');
var socketapi = require('../socketapi');
var router = express.Router();

var models = require('../models');

function is_ip_allowed(ip)
{
    for (var i = 0; i < global.ALLOWED_SUBNETS.length; i++) {
        if (global.ALLOWED_SUBNETS[i].contains(ip))
            return true;
    }
    return false;
}

/* POST from GTA application. */
router.post('/', function(req, res, next) {
    /* console.log('GOT POST'); */
    /* console.log(req.body); */

    var d = req.body;

    if (is_ip_allowed(d.ip)) {
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

                /* Update last activity of student */
                if (d.type == global.POST_EXIT && d.user in global.activities) {
                    delete global.activities[item.user];
                } else {
                    global.activities[d.user] = dt;
                }

                var data = {type: d.type, date: dt, user: d.user,
                            hostname: d.hostname, ip: d.ip, exercise_id: ex.id};
                if (d.type == 'command' || d.type == 'passed') {
                    data.command = d.command;
                    data.level = d.level;
                }

                models.Post.create(data).then(function(post) {
                    socketapi.io.emit('new_post', post);
                });
            });
        });
    }
    res.status(200).send();
});

module.exports = router;

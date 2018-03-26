var express = require('express');
var socketapi = require('../socketapi');
var router = express.Router();

var models = require('../models');

function is_ip_allowed(ip)
{
    if (!global.ALLOWED_SUBNETS.length)
        return true;

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
        /* exercise comes as a exercise_id.gta, but we want to get only id */
        var ex_number = parseInt(d.exercise_number.replace(/\D/g,''));
        models.Exercise.findOne({
            where: {
                status: 'active',
                id: ex_number
            }
        }).then(function(ex) {
            /* if exercise matches the query, the resultset should contain one item */
            if (ex) {
                var dt = new Date(0);
                dt.setUTCSeconds(d.date);

                var data = {type: d.type, date: dt, user: d.user,
                            hostname: d.hostname, ip: d.ip, exercise_id: ex.id};
                if (d.type == global.POST_COMMAND || d.type == global.POST_PASSED) {
                    try {
                        data.command = decodeURI(decodeURIComponent(d.command));
                    } catch (e) {
                        data.command = d.command;
                        console.error(e);
                    }
                }

                if ('homedir' in d)
                    data.homedir = d.homedir;

                if ('hash' in d)
                    data.hash = d.hash;

                if ('level' in d)
                    data.level = d.level;

                models.Post.create(data).then(function(post) {
                    socketapi.io.emit('new_post', post);
                });
            }
        });
    }
    res.status(200).send();
});

module.exports = router;

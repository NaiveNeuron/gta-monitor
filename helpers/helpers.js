var md5 = require('md5');
var cos_distance = require('compute-cosine-distance');
var jaccard = require('jaccard');
var kmeans = require('node-kmeans');

function jaccard_vector_index(a, b){
    var intersection = 0;
    var all = 0;
    for (var i = 0; i < a.length; i++) {
        if (a[i] == 1 || b[i] == 1) {
            all++;
            if (a[i] == b[i])
                intersection++;
        }
    }

    return 1 - (intersection / all);
}

module.exports = {
    pad: function (n) {
        return n < 10 ? '0' + n : n;
    },

    get_md5_hash: function(challenge_name, level, homedir) {
        return md5('i' + challenge_name + 'j%!d(string=' + level + ')k' + homedir + 'l');
    },

    get_point_mapping: function(pointmap, exid) {
        var mapping = [];
        for (var i = 0; i < pointmap.levels.length; i++) {
            if (pointmap.levels[i] != '' && pointmap.points[i] != '') {
                mapping.push({
                    level: pointmap.levels[i],
                    points: pointmap.points[i],
                    is_bonus: pointmap.is_bonus[i] == 'on' ? 1 : 0,
                    exercise_id: exid
                });
            }
        }

        return mapping;
    },

    compute_kmeans: function (set_commands, k, dist_function, callback) {
        var dist;
        switch (dist_function) {
            case 'cosine':
                dist = cos_distance;
                break;
            case 'jaccard':
                dist = jaccard_vector_index;
                break;
            default:
                dist = jaccard_vector_index;
                break;
        }

        kmeans.clusterize(set_commands.map(function(c) { return c.vector; }),
            {
                k: k,
                distance: function(a, b) {
                    return dist(a,b);
                }
            },
            callback
        );
    }
}

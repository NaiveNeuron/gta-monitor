function STExercise()
{
    this.students = {};
    this.level_commands = {};
}


STExercise.prototype.increment_or_set = function(dict, level, type) {
    level = level.match(/l[0-9]+/g) + '*';
    if (!(level in dict))
        dict[level] = {'passed': 0, 'command': 0};
    dict[level][type] += 1;
}


STExercise.prototype.initialize = function(posts)
{
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        if (!(post.user in this.students)) {
            this.students[post.user] = new Student(post.user, post.hostname, post.ip);
            this.all++;
        }
        this.students[post.user].add_post(post);

        if (post.type == POST_COMMAND || post.type == POST_PASSED)
            this.increment_or_set(this.level_commands, post.level, post.type);
    }
}

STExercise.prototype.initialize_level_histogram = function() {
    var ctx = document.getElementById('level_histogram');

    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(this.level_commands),
            datasets: [
                {
                    label: 'Passed',
                    data: Object.values(this.level_commands).map(function(item) {
                        return item[POST_PASSED] / (item[POST_PASSED]+item[POST_COMMAND]);
                    }),
                    backgroundColor: 'rgba(58, 225, 55, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Failed',
                    data: Object.values(this.level_commands).map(function(item) {
                        return item[POST_COMMAND] / (item[POST_PASSED]+item[POST_COMMAND]);
                    }),
                    backgroundColor: 'rgba(225, 58, 55, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                },
            ]
        },
        options: {
            tooltips: {
			    mode: 'label',
            },
            scales: {
                xAxes: [{
          	         stacked: true,
                     gridLines: { display: false },
                }],
                yAxes: [{
                    stacked: true,
                    ticks: {
                        beginAtZero:true
                    }
                }]
            }
        }
    });
}

var stexercise = new STExercise();

$(document).ready(function() {
    stexercise.initialize(POSTS);
    stexercise.initialize_level_histogram();
});

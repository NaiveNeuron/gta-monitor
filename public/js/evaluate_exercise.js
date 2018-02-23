function EVExercise()
{
    this.number;
    this.students = {};

    this.all = 0;
}

EVExercise.prototype.initialize = function(posts, evals)
{
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        if (!(post.user in this.students)) {
            this.students[post.user] = new Student(post.user, post.hostname, post.ip);
            this.all++;
        }
        this.students[post.user].add_post(post);
    }

    for (var i = 0; i < evals.length; i++) {
        var eval = evals[i];
        this.students[eval.user].score = eval.score;
    }

    for (var stud in this.students) {
        var student = this.students[stud];

        var row = '<tr class="user-row ' + (student.exit ? 'table-success' : '') + '" id="student-' + student.user + '" data-username="' + student.user + '">'
                +   '<td>' + student.user + '</td>'
                +   '<td>' + student.hostname + '</td>'
                +   '<td>' + student.ip + '</td>'
                +   '<td>' + student.level + '</td>'
                +   '<td>' + student.get_score() + '</td>'
                + '</tr>';

        $('.evaluate-exercise-table tbody').append(row);
    }
}

var evexercise = new EVExercise();

$(document).ready(function() {
    evexercise.initialize(POSTS, EVALS);
});

$(document).on('click', '.user-row', function(e) {
    var user = $(this).attr('data-username');
    var student = evexercise.students[user];

    initialize_modal(student);

    $('#student-detail-modal').modal('show');
});

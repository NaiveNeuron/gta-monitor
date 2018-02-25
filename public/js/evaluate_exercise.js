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
        this.students[eval.user].evaluate.set_score(eval.score);
        this.students[eval.user].evaluate.set_comment(eval.comment);
    }

    for (var stud in this.students) {
        var student = this.students[stud];

        var row = '<tr class="user-row ' + (student.exit ? 'table-success' : '') + '" id="student-' + student.user + '" data-username="' + student.user + '">'
                +   '<td>' + student.user + '</td>'
                +   '<td>' + student.hostname + '</td>'
                +   '<td>' + student.ip + '</td>'
                +   '<td>' + student.level + '</td>'
                +   '<td>' + student.get_working_time_or_dash() + '</td>'
                +   '<td class="score-cell">' + student.evaluate.get_score_or_dash() + '</td>'
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

    initialize_modal_footer(student);

    $('#student-detail-modal').modal('show');
});

$(document).on('submit','form.modal-evaluate-form', function(e) {
    var score = $(this).find('input[name="modal_evaluate_score"]').val();
    var comment = $(this).find('textarea[name="comment"]').val();
    var user = $(this).find('input[name="modal_evaluate_user"]').val();

    $('form.modal-evaluate-form .loader').css('visibility', 'visible');
    $('form.modal-evaluate-form button').css('visibility', 'hidden');

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            user: user,
            score: score,
            comment: comment
        },
        success: function(response) {
            evexercise.students[user].evaluate.set_score(score);
            evexercise.students[user].evaluate.set_comment(comment);
            evexercise.students[user].evaluate.update_score(score);
        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log('FAIL: ' + textStatus);
        },
        complete: function(jqXhr, textStatus) {
            $('form.modal-evaluate-form .loader').css('visibility', 'hidden');
            $('form.modal-evaluate-form button').css('visibility', 'visible');
        }
    });

    return false;
});

function EVExercise()
{
    this.number;
    this.students = {};

    this.last_level = '';

    this.all = 0;

    this.alternative = new Alternative();
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
        this.students[eval.user].evaluate.set_bonus(eval.bonus);
        this.students[eval.user].evaluate.set_comment(eval.comment);
    }

    for (var stud in this.students) {
        var student = this.students[stud];

        var row = '<tr class="user-row ' + (student.exit ? 'table-success' : '') + '" id="student-' + student.user + '" data-username="' + student.user + '">'
                +   '<td><div class="user-row-username">' + this.alternative.get_cell(student.user) + '</span></td>'
                +   '<td>' + student.hostname + '</td>'
                +   '<td>' + student.ip + '</td>'
                +   '<td>' + student.get_last_passed_level() + '</td>'
                +   '<td>' + student.get_working_time_or_dash() + '</td>'
                +   '<td>' + student.lines + '</td>'
                +   '<td class="score-cell">' + student.evaluate.get_score_or_dash() + '</td>'
                +   '<td class="bonus-cell">' + student.evaluate.get_bonus() + '</td>'
                + '</tr>';

        $('.evaluate-exercise-table tbody').append(row);
    }

    $('.evaluate-exercise-table').bootstrapTable({'search': true});
}

var evexercise = new EVExercise();
evexercise.alternative.build_alternatives(ALTERNATIVES);

$(document).ready(function() {
    evexercise.initialize(POSTS, EVALS);
});

$(document).on('click', '.user-row-username', function(){
    var el = $(this);

    var real_name = el.parent().parent().attr('data-username');
    var input = $('<input/>').val(evexercise.alternative.get_input_value(real_name));
    el.replaceWith(input);

    var save = function(){
        var new_name = input.val();

        $.ajax({
            url: '/exercise/evaluate/alternative/set',
            type: 'POST',
            data: {
                user: real_name,
                alternative: new_name
            },
            success: function(response) {
                evexercise.alternative.set_alternative(real_name, new_name);
            },
            error: function(jqXhr, textStatus, errorThrown) {
                console.log('FAIL: ' + textStatus, errorThrown);
            },
            complete: function(jqXhr, textStatus) {
                var div = $('<div class="user-row-username"/>').text(evexercise.alternative.get_cell(real_name));
                input.replaceWith(div);
            }
        });
    };

    input.one('click', function(e) { return false; });
    input.on('keydown', function(e) {
        if(e.keyCode == 13) {
            save();
        }
    });
    input.one('blur', save).focus();
    return false;
});

$(document).on('click', '.user-row', function(e) {
    var user = $(this).attr('data-username');
    var student = evexercise.students[user];

    initialize_modal_evaluate(student, evexercise.alternative.get_or_null(user));

    $('#student-detail-modal').modal('show');
});

$('#student-detail-modal').on('shown.bs.modal', function(e) {
    modal_scroll_commands();
});

$(document).on('submit','form.modal-evaluate-form', function(e) {
    var score = $(this).find('input[name="modal_evaluate_score"]').val();
    var bonus = $(this).find('input[name="modal_evaluate_bonus"]').val();
    var comment = $(this).find('textarea[name="comment"]').val();
    var user = $(this).find('input[name="modal_evaluate_user"]').val();

    var current_select = $('#student-' + user);

    $('form.modal-evaluate-form .loader').css('visibility', 'visible');
    $('form.modal-evaluate-form button').css('visibility', 'hidden');

    $.ajax({
        url: window.location.pathname,
        type: 'POST',
        data: {
            user: user,
            score: score,
            bonus: bonus,
            comment: comment
        },
        success: function(response) {
            evexercise.students[user].evaluate.set_score(score);
            evexercise.students[user].evaluate.set_bonus(bonus);
            evexercise.students[user].evaluate.set_comment(comment);
            evexercise.students[user].evaluate.update_score();
            evexercise.students[user].evaluate.update_bonus();

            var next_user = current_select.next().attr('data-username');
            if (next_user) {
                initialize_modal_evaluate(evexercise.students[next_user], evexercise.alternative.get_or_null(next_user));
                modal_scroll_commands();
            } else {
                $('#student-detail-modal').modal('hide');
            }
        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log('FAIL: ' + textStatus, errorThrown);
            console.log(jqXhr.responseJSON.message);
        },
        complete: function(jqXhr, textStatus) {
            $('form.modal-evaluate-form .loader').css('visibility', 'hidden');
            $('form.modal-evaluate-form button').css('visibility', 'visible');
        }
    });

    return false;
});

$(document).on('click', '#btn-auto-evaluate', function(e) {
    $('.evaluate-exercise-buttons .loader').css('visibility', 'visible');

    $.ajax({
        url: window.location.pathname.replace(/\/$/, '') + '/auto',
        type: 'POST',
        success: function(response) {
            for (var i = 0; i < response.data.length; i++) {
                var item = response.data[i];
                evexercise.students[item.user].evaluate.set_score(item.score);
                evexercise.students[item.user].evaluate.set_bonus(item.bonus);
                evexercise.students[item.user].evaluate.update_score();
                evexercise.students[item.user].evaluate.update_bonus();
            }
        },
        error: function(jqXhr, textStatus, errorThrown) {
            console.log('FAIL: ' + textStatus, errorThrown);
        },
        complete: function(jqXhr, textStatus) {
            $('.evaluate-exercise-buttons .loader').css('visibility', 'hidden');
        }
    });

    return false;
});

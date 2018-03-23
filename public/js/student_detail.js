function modal_append_command(command, level, date, passed)
{
    var date = get_date_from_string(date);
    var date_str = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());

    var msg = '<code' + (passed ? ' class="passed-command"' : '') + '>'
            +    date_str + ' ' + level + ' $ ' + command
            + '</code>';
    $('.modal-command-history').append(msg);
}

function modal_update_lines(lines)
{
    $('.modal-number-of-lines').text(lines);
}

function modal_scroll_commands()
{
    $('.modal-command-history').scrollTop($('.modal-command-history')[0].scrollHeight);
}

function initialize_modal(student, alternative)
{
    var alter_name = '';
    if (alternative)
        alter_name = ' (' + alternative + ')';

    $('.modal-title').text(student.get_name_hostname() + alter_name);
    $('.modal-ip').text(student.ip);

    $('.modal-command-history').empty();
    $('.modal-finished-at').empty();

    for (var i = 0; i < student.history.length; i++) {
        var post = student.history[i];

        if (post.type == POST_COMMAND || post.type == POST_PASSED) {
            modal_append_command(post.command, post.level, post.date, post.type == POST_PASSED);
        } else if (post.type == POST_START) {
            $('.modal-started-at').text(get_date_from_string(post.date));
        } else if (post.type == POST_EXIT) {
            $('.modal-finished-at').text(get_date_from_string(post.date));
        }
    }

    modal_update_lines(student.lines);
}

function initialize_modal_footer(student)
{
    $('.modal-evaluate-form input[name="modal_evaluate_score"]').val(student.evaluate.get_score());
    $('.modal-evaluate-form input[name="modal_evaluate_bonus"]').val(student.evaluate.get_bonus());
    $('.modal-evaluate-form input[name="modal_evaluate_user"]').val(student.user);
    $('.modal-evaluate-form textarea[name="comment"]').val(student.evaluate.get_comment());
}

function initialize_modal_evaluate(student, alternative)
{
    initialize_modal(student, alternative);
    initialize_modal_footer(student);
}

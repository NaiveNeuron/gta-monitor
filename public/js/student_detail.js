function modal_append_command(command, level, date, passed)
{
    var date = get_date_from_string(date);
    var date_str = pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());

    if (passed)
        var msg = '<code class="passed-command">' + date_str + ' ' + level + ' $ ' + command + '</code>';
    else
        var msg = '<code>' + date_str + ' ' + level + ' $ ' + command + '</code>';
    $('.modal-command-history').append(msg);
}

function modal_update_lines(lines)
{
    $('.modal-number-of-lines').text(lines);
}

function initialize_modal(student)
{
    $('.modal-title').text(student.get_name_hostname());
    $('.modal-ip').text(student.ip);

    $('.modal-command-history').empty();
    $('.modal-finished-at').empty();

    for (var i = 0; i < student.history.length; i++) {
        var post = student.history[i];

        if (post.type == 'command' || post.type == 'passed') {
            modal_append_command(post.command, post.level, post.date, post.type == 'passed');
        } else if (post.type == 'start') {
            $('.modal-started-at').text(get_date_from_string(post.date));
        } else if (post.type == 'exit') {
            $('.modal-finished-at').text(get_date_from_string(post.date));
        }
    }

    modal_update_lines(student.lines);
}

function initialize_modal_footer(student)
{
    $('.modal-evaluate-form input[name="modal_evaluate_score"]').val(student.evaluate.get_score());
    $('.modal-evaluate-form input[name="modal_evaluate_user"]').val(student.user);
    $('.modal-evaluate-form textarea[name="comment"]').val(student.evaluate.get_comment());
}

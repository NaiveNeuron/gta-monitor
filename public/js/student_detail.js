function modal_append_command(command, level, passed)
{
    if (passed)
        var msg = '<code class="passed-command">' + level + ' $ ' + command + '</code>';
    else
        var msg = '<code>' + level + ' $ ' + command + '</code>';
    $('.modal-command-history').append(msg);
}

function initialize_modal(student)
{
    $('.modal-title').text(student.get_name_hostname());
    $('.modal-ip').text(student.ip);

    $('.modal-command-history').empty();
    $('.modal-finished-at').empty();
    for (var i = 0; i < student.history.length; i++) {
        var post = student.history[i];
        // TODO: show time (and date) and also information about start / exit
        if (post.type == 'command') {
            modal_append_command(post.command, post.level, false);
        } else if (post.type == 'passed') {
            modal_append_command(post.command, post.level, true);
        } else if (post.type == 'start') {
            $('.modal-started-at').text(get_date_from_string(post.date));
        } else if (post.type == 'exit') {
            $('.modal-finished-at').text(get_date_from_string(post.date));
        }
    }
}

function initialize_modal_footer(student)
{
    $('.modal-evaluate-form input[name="modal_evaluate_score"]').val(student.evaluate.get_score());
    $('.modal-evaluate-form input[name="modal_evaluate_user"]').val(student.user);
    $('.modal-evaluate-form textarea[name="comment"]').val(student.evaluate.get_comment());
}

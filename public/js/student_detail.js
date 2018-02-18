$(document).on('click', '.user-box', function(e) {
    var user = $(this).attr('data-username');
    var student = exercise.students[user];
    //TODO
    $('.modal-title').text(student.get_name_hostname());
    $('.modal-ip').text(student.ip);

    $('.modal-command-history').empty();
    $('.modal-finished-at').empty();
    for (var i = 0; i < student.history.length; i++) {
        var post = student.history[i];
        // TODO: show time (and date) and also information about start / exit
        //       Green color for command that passed the level
        if (post.type == 'command') {
            $('.modal-command-history').append('<code>$ ' + post.command + '</code>');
        } else if (post.type == 'passed') {
            $('.modal-command-history').append('<code class="passed-command">$ ' + post.command + '</code>');
        } else if (post.type == 'start') {
            $('.modal-started-at').text(get_date_from_string(post.date));
        } else if (post.type == 'exit') {
            $('.modal-finished-at').text(get_date_from_string(post.date));
        }
    }

    $('#student-detail-modal').modal('show');
});

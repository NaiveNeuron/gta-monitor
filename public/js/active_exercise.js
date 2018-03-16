function Exercise()
{
    this.number;
    this.students = {};
    this.all = 0;
    this.finished = 0;
    this.positions = {};

    var last_level = parse_level_id(LAST_LEVEL);
    this.one_level_width = 0;
    if (last_level)
        this.one_level_width = 100 / last_level;

    this.modal_shown = false;
    this.modal_shown_user = '';

    for (var key in HALL_INITIAL) {
        this.positions[key] = new Position(HALL_INITIAL[key][0],
                                           HALL_INITIAL[key][1]);
    }
}

Exercise.prototype.create_student_and_add_post = function(post) {
    if (!(post.user in this.students)) {
        this.students[post.user] = new Student(post.user, post.hostname, post.ip);
        this.all++;
    }

    if (post.type != POST_HELP && post.type != POST_ACK)
        this.students[post.user].set_active(post.date);

    this.students[post.user].add_post(post);
}

Exercise.prototype.initialize_students = function(posts) {
    for(var i = 0; i < posts.length; i++) {
        this.create_student_and_add_post(posts[i]);
        if (posts[i].type == POST_EXIT)
            this.finished++;
    }

    for(var user in this.students) {
        this.create_new_box(this.students[user]);
        this.students[user].update_activity_time();
    }

    this.update_started_students();
    this.update_finished_students();
}

Exercise.prototype.move_away_occupied = function(pos) {
    $('#student-' + pos.user).appendTo('#active-exercise-students');
    $('#student-' + pos.user).css({'position': 'relative', 'top': 0, 'left': 0});

    if (!(this.students[pos.user].exit)) {
        /* if student hard quit, add grey bg color */
        this.students[pos.user].change_background('hardexit');
    }
}

Exercise.prototype.replace_box = function (pos, student) {
    if (pos.is_occupied())
        this.move_away_occupied(pos);

    $('#student-' + student.user).appendTo('#active-exercise-hall');
    $('#student-' + student.user).css({'position': 'absolute', 'top': pos.top , 'left': pos.left});

    this.positions[student.hostname].set_occupy(student.user);
}

Exercise.prototype.create_new_box = function(student) {
    var style = '';

    if (this.position_exists(student.hostname) && !student.exit) {
        var pos = this.positions[student.hostname];
        if (pos.is_occupied() && pos.user != student.user) {
            this.move_away_occupied(pos);
        }
        this.positions[student.hostname].set_occupy(student.user);
        style = ' style="position:absolute; top:' + pos.top + 'px; left:' + pos.left + 'px;"';
    }

    var box = '<div class="' + student.get_box_background() + ' text-white user-box" id="student-' + student.user + '" data-username="' + student.user
                    + '" data-hostname="' + student.hostname + '"' + style + '>'
            +   '<div class="user-box-info">'
            +     '<span class="user-box-user">' + student.get_name_hostname() + '</span>'
            +   '</div>'
            +   '<span class="user-box-level">' + student.level + '</span>'
            +   '<div class="user-box-activity-info">'
            +     '<div class="user-box-activity-attempts">Attempts: <span class="user-box-activity-attempts-number">' + student.level_attempts + '</span></div>'
            +     '<div class="user-box-inactivity-time">' + student.get_inactivity_time(new Date())['string'] + '</div>'
            +   '</div>'
            +   '<div class="user-box-command-info">$ '
            +     '<span class="user-box-command">' + student.get_last_command() + '</span>'
            +   '</div>'
            +   '<div class="user-box-progress-bar">'
            +     '<div class="user-box-progress"></div>'
            +   '</div>'
            + '</div>';

    if (this.position_exists(student.hostname) && !student.exit)
        $('#active-exercise-hall').append(box);
    else if (student.exit)
        $('#active-exercise-students').append(box);
    else
        $('#active-exercise-students').prepend(box);

    student.update_progress_bar(this.one_level_width);
    student.update_attempts();

    /* TODO: check if we cannot bind just the created box */
    bind_draggables();
}

Exercise.prototype.position_exists = function(hostname) {
    return hostname in this.positions;
}

Exercise.prototype.new_post = function(post) {
    var is_existing_student = (post.user in this.students);
    this.create_student_and_add_post(post);

    var student = this.students[post.user];
    switch (post.type) {
        case POST_START:
            student.level = '-';
            student.level_attempts = 0;

            if (!is_existing_student) {
                this.create_new_box(student);
                this.update_started_students();
            } else {
                /* if user exited previously, update statistics */
                if (student.exit) {
                    this.finished--;
                    student.exit = false;
                    this.update_finished_students();
                }

                /* user restarted the exercise and/or changed computer */
                if (post.hostname != student.hostname) {
                    var oldhostname = student.hostname;

                    /* update new info about student */
                    student.change_computer(post.hostname, post.ip);

                    /* if the new position is occupied by someone else, replace */
                    if (this.position_exists(student.hostname)) {
                        if (this.positions[student.hostname].user != student.user) {
                            this.replace_box(this.positions[student.hostname], student);
                        }
                    } else {
                        /* if we do not have specified position for new hostname */
                        $('#student-' + student.user).prependTo('#active-exercise-students');
                        $('#student-' + student.user).css({'position': 'relative', 'top': 0, 'left': 0});
                    }

                    /* unoccupy the position where student was previously placed */
                    if (this.position_exists(oldhostname))
                        this.positions[oldhostname].remove_occupy();
                } else {
                    if (this.position_exists(student.hostname)) {
                        /* if student is in upper container, move them to hall */
                        if (this.positions[student.hostname].user != student.user) {
                            this.replace_box(this.positions[post.hostname], student);
                        }
                    } else {
                        /* if the user is in upper container, move it to the beginning */
                        $('#student-' + student.user).prependTo('#active-exercise-students');
                    }
                }

                student.change_background('working');
            }
            break;
        case POST_EXIT:
            student.change_background('finished');
            this.finished++;
            this.update_finished_students();
            break;
        case POST_COMMAND:
        case POST_PASSED:
            $('#student-' + post.user + ' .user-box-command').text(post.command);
            $('#student-' + post.user + ' .user-box-level').text(student.level);
            if (this.modal_shown && this.modal_shown_user == post.user) {
                modal_append_command(post.command, post.level, post.date, post.type == POST_PASSED);
                modal_update_lines(student.lines);
            }
            break;
        case POST_HELP:
            student.set_help();
            break;
        case POST_ACK:
            student.set_ack();
            break;
    }
    student.update_progress_bar(this.one_level_width);
    student.update_attempts();
    student.update_activity_time();
}

Exercise.prototype.update_started_students = function() {
    $('#active-exercise-students-all').text(this.all);
}
Exercise.prototype.update_finished_students = function() {
    $('#active-exercise-students-finished').text(this.finished);
}

var exercise = new Exercise();

setInterval(function() {
    for (user in exercise.students) {
        if (!exercise.students[user].exit)
            exercise.students[user].update_activity_time();
    }
}, 5000);

$(document).on('click', '#btn-save-positions', function(e) {
    $.ajax({
        url: '/exercise/active/save',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(exercise.positions),

        success: function(data, textStatus, jQxhr){

        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log('Failed to save data.', textStatus, errorThrown);
        }
    });
});

$(document).on('click', '#btn-toggle-userboxes', function(e) {
    $('#active-exercise-students').toggle();
});

$(document).on('click', '.user-box', function(e) {
    var user = $(this).attr('data-username');
    var student = exercise.students[user];

    student.set_ack();

    initialize_modal(student);

    exercise.modal_shown_user = user;
    $('#student-detail-modal').modal('show');
});

$('#student-detail-modal').on('shown.bs.modal', function(e) {
    exercise.modal_shown = true;
});

$('#student-detail-modal').on('hide.bs.modal', function(e) {
    exercise.modal_shown_user = '';
    exercise.modal_shown = false;
});

socket.on('load_active_exercise', function(posts) {
    exercise.initialize_students(posts);
});

socket.on('new_post', function(post) {
    exercise.new_post(post);
});

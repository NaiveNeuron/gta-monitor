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

    if (jQuery.isEmptyObject(HALL_INITIAL)) {
        HALL_INITIAL = {'Default': {}};
    }

    this.current_room = '';
    for (var key in HALL_INITIAL) {
        this.positions[key] = {};

        if (this.current_room == '')
            this.set_current_room_name(key);

        this.create_new_tab(key);
        for (var pos in HALL_INITIAL[key]) {
            this.positions[key][pos] = new Position(HALL_INITIAL[key][pos][0],
                                                    HALL_INITIAL[key][pos][1]);
        }
    }

    this.alternative = new Alternative();
}

Exercise.prototype.create_student_and_add_post = function(post) {
    if (!(post.user in this.students)) {
        this.students[post.user] = new Student(post.user, post.hostname, post.ip);
        this.all++;
    }

    var student = this.students[post.user];

    if (post.type != POST_HELP && post.type != POST_ACK)
        student.set_active(post.date);

    if (!student.exit && post.type == POST_EXIT)
        this.finished++;
    else if (student.exit && post.type == POST_START)
        this.finished--;

    student.add_post(post);
}

Exercise.prototype.initialize_students = function(posts) {
    for(var i = 0; i < posts.length; i++) {
        this.create_student_and_add_post(posts[i]);
    }

    for(var user in this.students) {
        var student = this.students[user];
        this.create_new_box(student);
        student.update_activity_time();

        if (student.exit)
            student.remove_activity_alerts();
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

Exercise.prototype.replace_box = function(pos, student) {
    if (pos.is_occupied())
        this.move_away_occupied(pos);

    $('#student-' + student.user).appendTo('#active-exercise-hall-' + sanitize_room_name(room));
    $('#student-' + student.user).css({'position': 'absolute', 'top': pos.top , 'left': pos.left});

    var room = this.get_hostname_room(student.hostname);
    this.positions[room][student.hostname].set_occupy(student.user);
}

Exercise.prototype.create_new_box = function(student) {
    var style = '';

    if (this.position_exists(student.hostname) && !student.exit) {
        var room = this.get_hostname_room(student.hostname)
        var pos = this.positions[room][student.hostname];
        if (pos.is_occupied() && pos.user != student.user) {
            this.move_away_occupied(pos);
        }
        this.positions[room][student.hostname].set_occupy(student.user);
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
        this.append_to_room(box, student.hostname);
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
    for (var room in this.positions) {
        if (hostname in this.positions[room])
            return true;
    }
    return false;
}

Exercise.prototype.get_hostname_room = function(hostname) {
    /* if we are calling this, the position exists */
    for (var room in this.positions) {
        if (hostname in this.positions[room])
            return room;
    }
}

Exercise.prototype.append_to_room = function(box, hostname) {
    var append_to = this.get_hostname_room(hostname);
    $('#active-exercise-hall-' + sanitize_room_name(append_to)).append(box);
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
                    this.update_finished_students();
                }

                /* user restarted the exercise and/or changed computer */
                if (post.hostname != student.hostname) {
                    var oldhostname = student.hostname;

                    /* update new info about student */
                    student.change_computer(post.hostname, post.ip);

                    /* if the new position is occupied by someone else, replace */
                    if (this.position_exists(student.hostname)) {
                        var room = this.get_hostname_room(student.hostname);
                        if (this.positions[room][student.hostname].user != student.user) {
                            this.replace_box(this.positions[room][student.hostname], student);
                        }
                    } else {
                        /* if we do not have specified position for new hostname */
                        $('#student-' + student.user).prependTo('#active-exercise-students');
                        $('#student-' + student.user).css({'position': 'relative', 'top': 0, 'left': 0});
                    }

                    /* unoccupy the position where student was previously placed */
                    if (this.position_exists(oldhostname)) {
                        var room_oldhostname = this.get_hostname_room(oldhostname);
                        this.positions[room_oldhostname][oldhostname].remove_occupy();
                    }
                } else {
                    if (this.position_exists(student.hostname)) {
                        /* if student is in upper container, move them to hall */
                        var room = this.get_hostname_room(student.hostname);
                        if (this.positions[room][student.hostname].user != student.user) {
                            this.replace_box(this.positions[room][post.hostname], student);
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
            student.remove_activity_alerts();
            this.update_finished_students();
            break;
        case POST_COMMAND:
        case POST_PASSED:
            $('#student-' + post.user + ' .user-box-command').text(post.command);
            $('#student-' + post.user + ' .user-box-level').text(student.level);
            if (this.modal_shown && this.modal_shown_user == post.user) {
                modal_append_command(post.command, post.level, post.date, post.type == POST_PASSED);
                modal_update_lines(student.lines);
                modal_scroll_commands();
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

Exercise.prototype.create_new_tab = function(rawname) {
    var room_name = sanitize_room_name(rawname);
    $('#tabs ul').append('<li><a href="#active-exercise-hall-' + room_name + '">' + rawname + '</a></li>');
    $('#tabs').append('<div class="active-exercise-hall" id="active-exercise-hall-' + room_name +'" data-name="' + rawname + '"></div>');
}

Exercise.prototype.create_new_room_failed = function(msg) {
    $('.create-new-room-failed span').html(msg);
    $('.create-new-room-failed').css('display', 'block');
}

Exercise.prototype.create_new_room = function(name) {
    if (name in this.positions) {
        this.create_new_room_failed('Room "' + name + '" already exists!');
        return;
    }

    $('.create-new-room-failed').css('display', 'none');
    $('.creating-new-room').css('display', 'block');

    this.create_new_tab(name);
    this.positions[name] = {};

    bind_droppable('#active-exercise-hall-' + sanitize_room_name(name));

    this.save_positions_to_database();

    $('#tabs').tabs('refresh');
    $('.creating-new-room').css('display', 'none');
    $('#new-room-modal').modal('hide');
}

Exercise.prototype.rename_tab = function(oldname, newname) {
    var oldname_sanitized = sanitize_room_name(oldname);
    var newname_sanitized = sanitize_room_name(newname);

    /* update li>a element*/
    $('#tabs ul li a[href="#active-exercise-hall-' + oldname_sanitized + '"]').html(newname);
    $('#tabs ul li a[href="#active-exercise-hall-' + oldname_sanitized + '"]').attr('href', '#active-exercise-hall-' + newname_sanitized)

    /* update div element */
    $('#tabs div#active-exercise-hall-' + oldname_sanitized).attr('data-name', newname);
    $('#tabs div#active-exercise-hall-' + oldname_sanitized).attr('id', 'active-exercise-hall-' + newname_sanitized);
}

Exercise.prototype.rename_room_failed = function(msg) {
    $('.rename-room-failed span').html(msg);
    $('.rename-room-failed').css('display', 'block');
}

Exercise.prototype.rename_room = function(name) {
    if (name in this.positions) {
        this.rename_room_failed('Room "' + name + '" already exists!');
        return;
    }

    $('.rename-room-failed').css('display', 'none');
    $('.renaming-new-room').css('display', 'block');

    Object.defineProperty(this.positions, name,
        Object.getOwnPropertyDescriptor(this.positions, this.current_room));
    delete this.positions[this.current_room];

    this.rename_tab(this.current_room, name);
    bind_droppable('#active-exercise-hall-' + sanitize_room_name(name));

    this.set_current_room_name(name);
    this.save_positions_to_database();

    $('#tabs').tabs('refresh');
    $('.renaming-new-room').css('display', 'none');
    $('#rename-room-modal').modal('hide');

}

Exercise.prototype.set_current_room_name = function(rawname) {
    this.current_room = rawname;
}

Exercise.prototype.save_positions_to_database = function() {
    $.ajax({
        url: '/exercise/active/save',
        dataType: 'json',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(this.positions),

        success: function(data, textStatus, jQxhr){

        },
        error: function( jqXhr, textStatus, errorThrown ){
            console.log('Failed to save data.', textStatus, errorThrown);
        }
    });
}

Exercise.prototype.update_started_students = function() {
    $('#active-exercise-students-all').text(this.all);
}
Exercise.prototype.update_finished_students = function() {
    $('#active-exercise-students-finished').text(this.finished);
}

Exercise.prototype.is_create_box_grid_allowed = function() {
   return Object.keys(this.positions[this.current_room]).length == 0;
}
/* Automatically order boxes into a grid in the current room */
Exercise.prototype.create_box_grid = function() {
    if (!this.is_create_box_grid_allowed()) {
        return;
    }

    var width = -1;
    var height = -1;
    var next_top = 0;
    var next_left = 0;
    var container_width = $('#active-exercise-hall-' + this.current_room).width();

    for(var user in this.students) {
       var student = this.students[user];
        if (!student.exit && student.is_waiting_for_dragging()) {
            $('#student-' + student.user).detach().appendTo('#active-exercise-hall-' + this.current_room);
            $('#student-' + student.user).css({'position': 'absolute', 'top': next_top, 'left': next_left});

            this.positions[this.current_room][student.hostname] = new Position(next_top, next_left);
            this.positions[this.current_room][student.hostname].set_occupy(student.user);

            if (width == -1) {
                /* Compute the actual width and height if a box */
                width = $('#student-' + student.user).outerWidth();
                height = $('#student-' + student.user).outerHeight();
           }

           next_left += width;
           if (next_left + width > container_width) {
               next_left = 0;
               next_top += height;
           }
       }
    }
    bind_draggables();
}

var exercise = new Exercise();

$(document).ready(function() {
    $('#tabs').tabs({
        activate: function(event, ui) {
            exercise.set_current_room_name($(ui.newPanel[0]).attr('data-name'));
            bind_draggables();
        }
    });
});

setInterval(function() {
    for (user in exercise.students) {
        if (!exercise.students[user].exit)
            exercise.students[user].update_activity_time();
    }
}, 5000);

$(document).on('click', '#btn-save-positions', function(e) {
    exercise.save_positions_to_database();
});

$(document).on('click', '#btn-toggle-userboxes', function(e) {
    $('#active-exercise-students').toggle();
});

/* Create room stuff */
$(document).on('click', '#btn-create-room-submit', function(e) {
    exercise.create_new_room($('.modal-new-room-form #new_room_name').val());
});
$(document).on('submit','form.modal-new-room-form', function(e) {
    exercise.create_new_room($('.modal-new-room-form #new_room_name').val());

    return false;
});

/* Create grid stuff */
$(document).on('click', '#btn-order-boxes', function(e) {
    exercise.create_box_grid();
});

/* Rename room stuff */
$(document).on('click', '#btn-rename-room-submit', function(e) {
    exercise.rename_room($('.modal-rename-room-form #rename_room_name').val());
});
$(document).on('submit','form.modal-rename-room-form', function(e) {
    exercise.rename_room($('.modal-rename-room-form #rename_room_name').val());

    return false;
});

$(document).on('click', '.user-box', function(e) {
    var user = $(this).attr('data-username');
    var student = exercise.students[user];

    student.set_ack();

    initialize_modal(student, exercise.alternative.get_or_null(user));

    exercise.modal_shown_user = user;
    $('#student-detail-modal').modal('show');
});

$('#student-detail-modal').on('shown.bs.modal', function(e) {
    exercise.modal_shown = true;
    modal_scroll_commands();
});

$('#student-detail-modal').on('hide.bs.modal', function(e) {
    exercise.modal_shown_user = '';
    exercise.modal_shown = false;
});

socket.on('load_active_exercise', function(posts, alternatives) {
    exercise.alternative.build_alternatives(alternatives);
    exercise.initialize_students(posts);
});

socket.on('new_post', function(post) {
    exercise.new_post(post);
});

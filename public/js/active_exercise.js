function Exercise()
{
    this.number;
    this.students = {};
    this.all = 0;
    this.finished = 0;

    var temp_pos = {};
    Object.keys(HALL_INITIAL).forEach(function(key) {
        temp_pos[key] = new Position(HALL_INITIAL[key][0],
                                     HALL_INITIAL[key][1]);
    });
    this.positions = temp_pos;
}

Exercise.prototype.create_student_and_add_post = function(post) {
    if (!(post.user in this.students)) {
        this.students[post.user] = new Student(post.user, post.hostname, post.ip);
        this.all++;
    }
    this.students[post.user].add_post(post);
}

Exercise.prototype.initialize_students = function(posts) {
    for(var i = 0; i < posts.length; i++) {
        this.create_student_and_add_post(posts[i]);
        if (posts[i].type == 'exit')
            this.finished++;
    }

    for(var user in this.students) {
        var u = this.students[user];
        if (u.hostname in this.positions)
            this.positions[u.hostname].set_occupy(user);
        this.create_new_box(u);
    }

    this.update_started_students();
    this.update_finished_students();
}

Exercise.prototype.create_new_box = function(student) {
    var style = '';
    if (student.hostname in this.positions && !student.exit) {
        var pos = this.positions[student.hostname];
        if (pos.occupied && pos.user != student.user) {
            $('#student-' + pos.user).appendTo('#active-exercise-students');
            $('#student-' + pos.user).css({'position': 'relative', 'top': 0, 'left': 0});
        }
        style = ' style="position:absolute; top:' + pos.top + 'px; left:' + pos.left + 'px;"';
    }

    var box = '<div class="' + student.get_box_background() + ' text-white user-box" id="student-' + student.user + '" data-username="' + student.user
                    + '" data-hostname="' + student.hostname + '"' + style + '>'
            +   '<div class="user-box-info">'
            +     '<span class="user-box-user">' + student.get_name_hostname() + '</span>'
            +     '<span>Level: <span class="user-box-level">' + student.level + '</span></span>'
            +   '</div>'
            +   '<div class="user-box-command-info">$ '
            +     '<span class="user-box-command">' + student.get_last_command() + '</span>'
            +   '</div>'
            + '</div>';

    if (student.hostname in this.positions && !student.exit) {
        this.positions[student.hostname].set_occupy(student.user);
        $('#active-exercise-hall').append(box);
    } else if (student.exit)
        $('#active-exercise-students').append(box);
    else
        $('#active-exercise-students').prepend(box);
    /* TODO: check if we cannot bind just the created box */
    bind_draggables();
}

Exercise.prototype.new_post = function(post) {
    this.create_student_and_add_post(post);
    switch (post.type) {
        case 'start':
            /* TODO: if student restarted the exercise, just update the box appropriately (change hostname, ip and stuff) */
            this.create_new_box(this.students[post.user]);
            this.update_started_students();
            break;
        case 'exit':
            /* TODO: check if we need to remove other bg-xxx classes in the future */
            $('#student-' + post.user).removeClass('bg-primary').addClass('bg-success');
            this.finished++;
            this.update_finished_students();
            break;
        case 'command':
            $('#student-' + post.user + ' .user-box-command').text(post.command);
            break;
        case 'passed':
            $('#student-' + post.user + ' .user-box-level').text(this.students[post.user].level);
            break;
    }
}

Exercise.prototype.new_activity_of_student = function(username, active) {
    this.students[username].active = active;
    this.update_activity_of_student(username);
}

Exercise.prototype.update_activity_of_student = function(username) {
    var student = this.students[username];
    if (student.active)
        $('#student-' + username).removeClass('inactive-student');
    else
        $('#student-' + username).addClass('inactive-student');
}

Exercise.prototype.update_started_students = function() {
    $('#active-exercise-students-all').text(this.all);
}
Exercise.prototype.update_finished_students = function() {
    $('#active-exercise-students-finished').text(this.finished);
}

var exercise = new Exercise();

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
            alert('Failed to save data.');
        }
    });
});

socket.on('load_active_exercise', function(posts, inactive) {
    exercise.initialize_students(posts);
    for (var i = 0; i < inactive; i++) {
        exercise.new_activity_of_student(inactive[i], false);
    }
});

socket.on('new_post', function(post) {
    exercise.new_post(post);
});

socket.on('new_inactive_student', function(username) {
    exercise.new_activity_of_student(username, false);
});

socket.on('new_active_student', function(username) {
    exercise.new_activity_of_student(username, true);
});

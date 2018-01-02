function Exercise()
{
    this.number;
    this.students = {};
    this.all = 0;
    this.finished = 0;
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
        this.create_new_box(this.students[user]);
    }

    this.update_started_students();
    this.update_finished_students();
}

Exercise.prototype.create_new_box = function(student) {
    var box = '<div class="' + student.get_box_background() + ' text-white user-box" id="student-' + student.user + '" data-username="' + student.user + '">'
            +   '<div class="user-box-info">'
            +     '<span class="user-box-user">' + student.get_name_hostname() + '</span>'
            +     '<span>Level: <span class="user-box-level">' + student.level + '</span></span>'
            +   '</div>'
            +   '<div class="user-box-command-info">$ '
            +     '<span class="user-box-command">' + student.get_last_command() + '</span>'
            +   '</div>'
            + '</div>';

    $('#active-exercise-students').append(box);
}

Exercise.prototype.new_post = function(post) {
    this.create_student_and_add_post(post);
    switch (post.type) {
        case 'start':
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

Exercise.prototype.update_started_students = function() {
    $('#active-exercise-students-all').text(this.all);
}
Exercise.prototype.update_finished_students = function() {
    $('#active-exercise-students-finished').text(this.finished);
}

var exercise = new Exercise();

socket.on('load_active_exercise', function(posts) {
    exercise.initialize_students(posts);
});

socket.on('new_post', function(post) {
    exercise.new_post(post);
});

$(document).on('click', '.user-box', function(e) {
    var user = $(this).attr('data-username');
    var student = exercise.students[user];
    //TODO
    $('.modal-title').text(student.get_name_hostname());
    $('.modal-ip').text(student.ip);


    $('#student-detail-modal').modal('show');
});

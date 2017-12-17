function Exercise()
{
    this.number;
    this.students = {};
}

Exercise.prototype.create_student_and_add_post = function(post) {
    if (!(post.user in this.students)) {
        this.students[post.user] = new Student(post.user, post.hostname, post.ip);
    }
    this.students[post.user].add_post(post);
}

Exercise.prototype.initialize_students = function(posts) {
    for(var i = 0; i < posts.length; i++) {
        this.create_student_and_add_post(posts[i]);
    }

    for(var user in this.students) {
        this.create_new_box(this.students[user]);
    }
}

Exercise.prototype.create_new_box = function(student) {
    var box = '<div class="' + student.get_box_background() + ' text-white user-box" id="student-' + student.user + '">'
            +   '<div class="user-box-info">'
            +     '<span class="user-box-user">' + student.get_name_hostname() + '</span>'
            +     '<span class="user-box-ip">' + student.ip + '</span>'
            +     '<span class="user-box-level">Level: ' + student.level + '</span>'
            +   '</div>'
            +   '<div class="user-box-command-info">Latest: $ '
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
            break;
        case 'exit':
            /* TODO: check if we need to remove other bg-xxx classes in the future */
            $('#student-' + post.user).removeClass('bg-primary').addClass('bg-success');
            break;
        case 'command':
            $('#student-' + post.user + ' .user-box-command').text(post.command);
            break;
    }
}




var exercise = new Exercise();

socket.on('load_active_exercise', function(posts){
    exercise.initialize_students(posts);
});

socket.on('new_post', function(post) {
    exercise.new_post(post);
});

$(document).ready(function() {


});

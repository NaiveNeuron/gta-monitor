function Exercise()
{
    this.number;
    this.students = {};
}

Exercise.prototype.create_students = function(posts) {
    for(var i = 0; i < posts.length; i++) {
        var p = posts[i];
        if (!(p.user in this.students)) {
            this.students[p.user] = new Student(p.user, p.hostname, p.ip);
        }
        this.students[p.user].add_post(p);
    }

    for(var user in this.students) {
        this.create_new_box(this.students[user]);
    }
}

Exercise.prototype.create_new_box = function(student) {
    var box = '<div class="bg-primary text-white user-box">'
            +   '<div class="user-box-info">'
            +     '<span class="box-user">' + student.get_name_hostname() + '</span>'
            +     '<span class="box-ip">' + student.ip + '</span>'
            +     '<span class="box-level">Level: ' + student.level + '</span>'
            +   '</div>'
            +   '<div class="user-box-command">Latest: $ '
            +     student.get_last_command();
            +   '</div>'
            + '</div>';

    $('#active-exercise-students').append(box);
}




var exercise = new Exercise();

socket.on('load_active_exercise', function(posts){
    exercise.create_students(posts);
});

$(document).ready(function() {


});

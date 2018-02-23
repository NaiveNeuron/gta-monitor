function EVExercise()
{
    this.number;
    this.students = {};

    this.all = 0;
}

EVExercise.prototype.initialize = function(posts)
{
    for (var i = 0; i < posts.length; i++) {
        var post = posts[i];
        if (!(post.user in this.students)) {
            this.students[post.user] = new Student(post.user, post.hostname, post.ip);
            this.all++;
        }
        this.students[post.user].add_post(post);
    }

    for (var stud in this.students) {
        var student = this.students[stud];

        var row = '<tr class="' + (student.exit ? 'table-success' : '') + '">'
                +   '<td>' + student.user + '</td>'
                +   '<td>' + student.hostname + '</td>'
                +   '<td>' + student.ip + '</td>'
                +   '<td>' + student.level + '</td>'
                +   '<td>' + '</td>'
                + '</tr>';

        $('.evaluate-exercise-table tbody').append(row);
    }
}

var evexercise = new EVExercise();

$(document).ready(function() {
    evexercise.initialize(POSTS);
});

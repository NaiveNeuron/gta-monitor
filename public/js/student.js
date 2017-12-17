function Student(user, hostname, ip)
{
    this.user = user;
    this.hostname = hostname;
    this.ip = ip;
    this.level = 1;
    this.history = [];
    this.exit = false;
}

Student.prototype.get_name_hostname = function() {
    return this.user + '@' + this.hostname;
}

Student.prototype.get_last_command = function () {
    for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].type == 'command')
            return this.history[i].command;
    }
    return '';
}

Student.prototype.get_box_background = function() {
    if (this.exit)
        return 'bg-success';
    return 'bg-primary';
}

Student.prototype.add_post = function(post) {
    var level = null;
    var command = null;

    if ('level' in post)
        level = post.level

    if ('command' in post)
        command = post.command

    this.history.push(new Post(post.type, post.date, post.user, post.hostname,
                               post.ip, level, command));

    if (post.type == 'passed')
        this.level++;
    else if (post.type == 'exit')
        this.exit = true;
}

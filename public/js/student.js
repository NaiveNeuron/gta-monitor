function Student(user, hostname, ip)
{
    this.user = user;
    this.hostname = hostname;
    this.ip = ip;
    this.level = 1;
    this.history = [];
}

Student.prototype.get_name_hostname = function() {
    return this.user + '@' + this.hostname;
}

Student.prototype.get_last_command = function () {
    // TODO
    return 'test | test | test | test | test |';
}

Student.prototype.add_post = function(post) {
    var level = null;
    var command = null;

    if ('level' in post)
        level = post.level

    if ('command' in post)
        command = post.command

    if (post.type == 'passed')
        this.level++;

    this.history.push(new Post(post.type, post.date, post.user, post.hostname,
                               post.ip, level, command))
}

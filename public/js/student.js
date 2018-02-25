var BACKGROUNDS = {
    'finished': 'bg-success',
    'working': 'bg-primary',
    'hardexit': 'bg-secondary'
};

function Student(user, hostname, ip)
{
    this.user = user;
    this.hostname = hostname;
    this.ip = ip;
    this.level = '-';
    this.history = [];
    this.exit = false;
    this.active = true;

    this.started_at = null;
    this.finished_at = null;

    /* Evaluation stuff */
    this.evaluate = new Evaluate(user);
}

Student.prototype.get_name_hostname = function() {
    return this.user + '@' + this.hostname;
}

Student.prototype.get_last_command = function () {
    for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].type == 'command' || this.history[i].type == 'passed')
            return this.history[i].command;
    }
    return '';
}

Student.prototype.get_working_time_or_dash = function() {
    if (this.started_at != null && this.finished_at != null) {
        var diff = new Date(this.finished_at - this.started_at);
        return diff.getHours() + ':' + diff.getMinutes() + ':' + diff.getSeconds();
    }
    return '-';
}

Student.prototype.update_activity_border = function() {
    if (this.active)
        $('#student-' + this.user).removeClass('inactive-student');
    else
        $('#student-' + this.user).addClass('inactive-student');
}

Student.prototype.update_activity = function(active) {
    this.active = active;
    this.update_activity_border();
}

Student.prototype.change_computer = function(hostname, ip) {
    this.hostname = hostname;
    this.ip = ip;

    $('#student-' + this.user).attr('data-hostname', this.hostname);
    $('#student-' + this.user + ' .user-box-user').text(this.get_name_hostname());
}

Student.prototype.change_background = function(state) {
    var selector = $('#student-' + this.user);
    for (var bg in BACKGROUNDS) {
        if (bg == state)
            selector = selector.addClass(BACKGROUNDS[bg]);
        else
            selector = selector.removeClass(BACKGROUNDS[bg]);
    }
}

Student.prototype.get_box_background = function() {
    if (this.exit)
        return BACKGROUNDS['finished'];
    return BACKGROUNDS['working'];
}

Student.prototype.add_post = function(post) {
    var level = post.level;
    var command = post.command;

    if (level)
        this.level = level;

    this.history.push(new Post(post.type, post.date, post.user, post.hostname,
                               post.ip, level, command));

    if (post.type == 'exit') {
        this.exit = true;
        this.finished_at = new Date(post.date);
    } else if (post.type == 'start') {
        this.exit = false;
        this.started_at = new Date(post.date);

        if (this.finished_at != null)
            this.finished_at = null;
    }
}

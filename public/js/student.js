var BACKGROUNDS = {
    'finished': 'bg-success',
    'working': 'bg-primary',
    'hardexit': 'bg-secondary',
    'help': 'bg-warning'
};

var MAX_LEVEL_ATTEMPTS = 7;

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

    this.lines = 0;
    this.level_attempts = 0;
    this.last_activity_time = null;

    this.help = false;

    /* Evaluation stuff */
    this.evaluate = new Evaluate(user);
}

Student.prototype.get_name_hostname = function() {
    return this.user + '@' + this.hostname;
}

Student.prototype.get_last_passed_post = function() {
    for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].type == POST_PASSED)
            return this.history[i];
    }
    return null;
}

Student.prototype.get_last_passed_level = function() {
    var last_passed = this.get_last_passed_post();
    return last_passed ? last_passed.level : '-';
}

Student.prototype.get_last_command = function () {
    var last_post = this.get_last_action_post();
    return last_post ? last_post.command : '';
}

Student.prototype.get_last_action_post = function() {
    for (var i = this.history.length - 1; i >= 0; i--) {
        if (this.history[i].type == POST_COMMAND || this.history[i].type == POST_PASSED)
            return this.history[i];
    }
    return null;
}

Student.prototype.get_working_time_or_dash = function() {
    if (this.started_at != null && this.finished_at != null) {
        var diff = new Date(this.finished_at - this.started_at);
        return pad(diff.getUTCHours()) + ':' + pad(diff.getUTCMinutes()) + ':' + pad(diff.getUTCSeconds());
    }
    return '-';
}

Student.prototype.get_working_time_seconds = function() {
    if (this.started_at != null && this.finished_at != null) {
        var diff = new Date(this.finished_at - this.started_at);
        return diff.getTime() / 1000;;
    }
    return null;
}

/* Return dict containing {'string': MM:SS, 'seconds': diff} */
Student.prototype.get_inactivity_time = function(now) {
    var diff = new Date(now - this.last_activity_time);
    return {'string': pad(diff.getUTCMinutes()) + ':' + pad(diff.getUTCSeconds()),
            'seconds': diff.getTime() / 1000};
}

Student.prototype.update_activity = function() {
    var selector = $('#student-' + this.user + ' .user-box-inactivity-time');
    if (!this.active && !selector.hasClass('slow-fadeinout'))
        selector.addClass('slow-fadeinout');
    else if (this.active && selector.hasClass('slow-fadeinout'))
        selector.removeClass('slow-fadeinout');
}

Student.prototype.update_activity_time = function() {
    var times = this.get_inactivity_time(new Date());
    if (times['seconds'] > INACTIVITY_TIME && this.active) {
        this.active = false;
    }
    this.update_activity();
    $('#student-' + this.user + ' .user-box-inactivity-time').text(times['string']);
}

Student.prototype.set_active = function(date) {
    this.active = true;
    this.last_activity_time = get_date_from_string(date);
}

Student.prototype.remove_activity_alerts = function() {
    $('#student-' + this.user + ' .user-box-inactivity-time').removeClass('slow-fadeinout');
    $('#student-' + this.user + ' .user-box-activity-attempts').removeClass('slow-fadeinout');
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

Student.prototype.update_progress_bar = function(one_level_width) {
    var width = '0%';
    var last_passed = this.get_last_passed_post();
    if (last_passed) {
        var last_lvl = parse_level_id(last_passed.level);

        if (last_lvl != null) {
            width = Math.min(100, (one_level_width * (last_lvl + 1))) + '%';
        }
    }
    $('#student-' + this.user + ' .user-box-progress').width(width);
}

Student.prototype.update_attempts = function() {
    var selector = $('#student-' + this.user + ' .user-box-activity-attempts');

    if (this.level_attempts > MAX_LEVEL_ATTEMPTS && !this.exit && this.get_last_action_post().type != POST_PASSED) {
        if (!selector.hasClass('slow-fadeinout'))
            selector.addClass('slow-fadeinout');
    } else if (selector.hasClass('slow-fadeinout'))
        selector.removeClass('slow-fadeinout');

    $('#student-' + this.user + ' .user-box-activity-attempts-number').text(this.level_attempts);
}

Student.prototype.set_help = function() {
    this.help = true;
    this.change_background('help');
}

Student.prototype.set_ack = function() {
    if (!this.exit && this.help)
        this.change_background('working');

    this.help = false;
}

Student.prototype.add_post = function(post) {
    var level = post.level;
    var command = post.command;

    if (level) {
        if (post.type != POST_HELP && post.type != POST_ACK) {
            if (this.level == level)
                this.level_attempts++;
            else
                this.level_attempts = 1;
        }

        this.level = level;
    }

    this.history.push(new Post(post.type, post.date, post.user, post.hostname,
                               post.ip, level, command));

    if (post.type == POST_EXIT) {
        this.exit = true;
        this.finished_at = new Date(post.date);
    } else if (post.type == POST_START) {
        this.exit = false;
        this.started_at = new Date(post.date);

        if (this.finished_at != null)
            this.finished_at = null;
    } else if (post.type == POST_COMMAND || post.type == POST_PASSED) {
        this.lines++;
    }
}

Student.prototype.is_waiting_for_dragging = function() {
    return $('#student-' + this.user).parent().attr('id') == 'active-exercise-students';
}

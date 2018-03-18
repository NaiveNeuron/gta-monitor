function Alternative()
{
    this.names = {};
}

Alternative.prototype.build_alternatives = function(alternatives) {
    for (var i = 0; i < alternatives.length; i++)
        this.names[alternatives[i].user] = alternatives[i].alternative;
}

Alternative.prototype.set_alternative = function(user, to) {
    if (to == '') {
        if (user in this.names)
            delete this.names[user];
    } else
        this.names[user] = to;
}

Alternative.prototype.get_cell = function(user) {
    if (user in this.names)
        return user + ' (' + this.names[user] + ')';
    return user;
}

Alternative.prototype.get_input_value = function(user) {
    if (user in this.names)
        return this.names[user];
    return '';
}

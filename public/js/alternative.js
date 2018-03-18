function Alternative()
{
    this.names = {};
}

Alternative.prototype.build_alternatives = function(alternatives) {
    for (var i = 0; i < alternatives.length; i++)
        this.names[alternatives[i].user] = alternatives[i].alternative;
}

Alternative.prototype.get_or_null = function(user) {
    if (user in this.names)
        return this.names[user];
    return null;
}

Alternative.prototype.set_alternative = function(user, to) {
    if (to == '') {
        if (user in this.names)
            delete this.names[user];
    } else
        this.names[user] = to;
}

Alternative.prototype.get_cell = function(user) {
    var alternative = this.get_or_null(user);
    return alternative ? (user + ' (' + alternative + ')') : user;
}

Alternative.prototype.get_input_value = function(user) {
    var alternative = this.get_or_null(user);
    return alternative ? alternative : '';
}

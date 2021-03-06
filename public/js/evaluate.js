function Evaluate(user)
{
    this.user = user;
    this.score = null;
    this.bonus = 0;
    this.comment = '';
}

Evaluate.prototype.set_score = function(score) {
    this.score = score;
}

Evaluate.prototype.set_bonus = function(bonus) {
    this.bonus = bonus;
}

Evaluate.prototype.update_score = function() {
    $('#student-' + this.user + ' .score-cell').text(this.get_score_or_dash());
}

Evaluate.prototype.update_bonus = function() {
    $('#student-' + this.user + ' .bonus-cell').text(this.get_bonus());
}

Evaluate.prototype.get_score_or_dash = function() {
    return this.score == null ? '-' : this.score;
}

Evaluate.prototype.get_score = function() {
    return this.score == null ? '' : this.score;
}

Evaluate.prototype.get_bonus = function() {
    return this.bonus;
}

Evaluate.prototype.set_comment = function(comment) {
    this.comment = comment;
}

Evaluate.prototype.get_comment = function() {
    return this.comment;
}

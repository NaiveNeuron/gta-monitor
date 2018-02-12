function Position(top, left)
{
    this.top = top;
    this.left = left;
    this.occupied = false;
    this.user = '';
}

Position.prototype.toJSON = function() {
        return [this.top, this.left];
}

Position.prototype.change_position = function(top, left) {
    this.top = top;
    this.left = left;
}

Position.prototype.set_occupy = function(user) {
    this.user = user;
    this.occupied = true;
}

Position.prototype.remove_occupy = function() {
    this.user = '';
    this.occupied = false;
}

Position.prototype.is_occupied = function() {
    return this.occupied;
}

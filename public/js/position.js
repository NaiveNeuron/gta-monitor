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

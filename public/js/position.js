function Position(top, left)
{
    this.top = top;
    this.left = left;
    this.occupied = false;
}

Position.prototype.toJSON = function() {
        return [this.top, this.left];
}

Position.prototype.change_position = function(top, left) {
    this.top = top;
    this.left = left;
}

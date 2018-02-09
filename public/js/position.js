function Position(top, left)
{
    this.top = top;
    this.left = left;
}

Position.prototype.toJSON = function() {
        return [this.top, this.left];
}

Position.prototype.change_position = function(top, left) {
    this.top = top;
    this.left = left;
}

$(document).ready(function() {
    $('#active-exercise-hall').droppable({
        drop: function( event, ui ) {
            var pos = ui.position;
            ui.draggable.appendTo(this);
            ui.draggable.css({'position': 'absolute', 'top': pos.top, 'left': pos.left});

            var hostname = ui.draggable.attr('data-hostname');
            if (hostname in exercise.positions)
                exercise.positions[hostname].change_position(pos.top, pos.left);
            else {
                exercise.positions[hostname] = new Position(pos.top, pos.left);
                exercise.positions[hostname].set_occupy(ui.draggable.attr('data-username'));
            }
        }
    });

    $('#active-exercise-students').droppable({
        drop: function( event, ui ) {
            var pos = ui.position;
            ui.draggable.appendTo(this);
            ui.draggable.css({'position': 'relative', 'top': '', 'left': ''});

            var hostname = ui.draggable.attr('data-hostname');
            if (hostname in exercise.positions)
                delete exercise.positions[hostname];
        }
    });
});

function bind_draggables() {
    $('.user-box').draggable({
        revert: 'invalid',
        helper: 'clone',
        appendTo: '#active-exercise-hall',
    });
}

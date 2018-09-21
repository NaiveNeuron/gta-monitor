function bind_droppable(element) {
    $(element).droppable({
        drop: function( event, ui ) {
            var pos = ui.position;
            ui.draggable.appendTo(this);
            ui.draggable.css({'position': 'absolute', 'top': pos.top, 'left': pos.left});

            var hostname = ui.draggable.attr('data-hostname');
            if (exercise.position_exists(hostname)) {
                var room = exercise.get_hostname_room(hostname);
                exercise.positions[room][hostname].change_position(pos.top, pos.left);
            } else {
                exercise.positions[exercise.current_room][hostname] = new Position(pos.top, pos.left);
                exercise.positions[exercise.current_room][hostname].set_occupy(ui.draggable.attr('data-username'));
            }
        }
    });
}

$(document).ready(function() {
    for (var room in exercise.positions)
        bind_droppable('#active-exercise-hall-' + sanitize_room_name(room));

    $('#active-exercise-students').droppable({
        drop: function( event, ui ) {
            var pos = ui.position;
            ui.draggable.appendTo(this);
            ui.draggable.css({'position': 'relative', 'top': '', 'left': ''});

            var hostname = ui.draggable.attr('data-hostname');
            if (exercise.position_exists(hostname)) {
                var room = exercise.get_hostname_room(hostname);
                delete exercise.positions[room][hostname];
            }
        }
    });
});

function bind_draggables() {
    $('.user-box').draggable({
        revert: 'invalid',
        helper: 'clone',
        appendTo: '#active-exercise-hall-' + sanitize_room_name(exercise.current_room),
    });
}

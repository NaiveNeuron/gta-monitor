$(document).ready(function() {
    $('#active-exercise-hall').droppable({
        drop: function( event, ui ) {
            var pos = ui.position;
            ui.draggable.appendTo(this);
            ui.draggable.css({'position': 'absolute', 'top': pos.top, 'left': pos.left});
        }
    });

    $('#active-exercise-students').droppable({
        drop: function( event, ui ) {
            var pos = ui.position;
            ui.draggable.appendTo(this);
            ui.draggable.css({'position': 'relative', 'top': '', 'left': ''});
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

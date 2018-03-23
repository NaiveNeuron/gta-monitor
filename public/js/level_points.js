$(document).on('change', '.exercise-levels-points input[type="checkbox"]', function() {
    var value = $(this).is(':checked') ? 'on' : 'off';

    $(this).siblings("input[name='pointmap[is_bonus][]']").val(value);
});

$(document).on('click', '#btn-add-levels-points', function(e) {
    var div = '<div class="form-inline">'
            +   '<label>Bonus</label>'
            +   '<input type="hidden" name="pointmap[is_bonus][]" value="off">'
            +   '<input type="checkbox" class="form-check-input">'
            +   '<input type="text" class="form-control m-2" placeholder="Level name" name="pointmap[levels][]">'
            +   '<input type="number" class="form-control m-2" placeholder="Points" name="pointmap[points][]">'
            + '</div>';

    $('.exercise-levels-points').append(div);
    return false;
});

$(document).on('click', '#btn-rm-levels-points', function(e) {
    $('.exercise-levels-points div').last().remove();
    return false;
});

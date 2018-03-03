function get_date_from_string(d)
{
    return new Date(d);
}

function pad(n)
{
    return n < 10 ? '0' + n : n;
}

function parse_level_id(level)
{
    var re = /l[0-9]+/i;
    var matched = level.match(re);
    if (matched) {
        return parseInt(matched[0].replace(/\D/g,''));
    }
    return null;
}

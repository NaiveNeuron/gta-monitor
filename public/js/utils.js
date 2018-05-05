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

function median(numbers) {
    var median = 0;
    var numsLen = numbers.length;
    numbers.sort(function(a,b) { return a-b; });

    if (numsLen % 2 === 0)
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    else
        median = numbers[(numsLen - 1) / 2];

    return median;
}

var T = new tsnejs.tSNE({
    epsilon: 2, // epsilon is learning rate (10 = default)
    perplexity: 5
});

$(document).ready(function() {
    if (CLUSTERS.length) {
        var dists = CLUSTERS.map(function(c) {
            return c.items.map(function(i) {
                return [i.vector, c.id];
            });
        });

        dists = [].concat.apply([], dists);
        var data = dists.map(function(d) {
            return d[0];
        });

        T.initDataRaw(data);

        for(var k = 0; k < 500; k++) {
           T.step();
        }

        var Y = T.getSolution();

        console.log(Y.map(function(pos){ return {x: pos[0]/20, y: pos[1]/20}}))
        var ctx = document.getElementById('tsnecanvas').getContext('2d');
        var scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Scatter Dataset',
                    fill: false,
                    showLine: false,
                    data: Y.map(function(pos){ return {x: pos[0], y: pos[1]}})
                }]
            },
            options: {
                title: {
                    display: true,
                    text: 'Vizualization of vectors of bag of words using t-SNE algorithm'
                }
            }
        });
    }
});

var POINT_COLORS = [
    'red', 'blue', 'green', 'orange', 'purple', 'lightgreen', 'lightblue',
    'magenta', 'brown', 'grey'
]

function jaccard_vector_index(a, b){
    var intersection = 0;
    var all = 0;
    for (var i = 0; i < a.length; i++) {
        if (a[i] == 1 || b[i] == 1) {
            all++;
            if (a[i] == b[i])
                intersection++;
        }
    }

    return 1 - (intersection / all);
}

var T = new tsnejs.tSNE({
    epsilon: 2, // epsilon is learning rate (10 = default)
    perplexity: 5
});

$(document).ready(function() {
    if (CLUSTERS.length) {
        var pairs = CLUSTERS.map(function(c) {
            return c.items.map(function(i) {
                return [i.vector, c.id];
            });
        });
        pairs = [].concat.apply([], pairs);
        var data = pairs.map(function(d) { return d[0]; });

        var dist_matrix = [];
        for (var i = 0; i < data.length; i++) {
            dist_matrix.push([]);
            for (var j = 0; j < data.length; j++)
                dist_matrix[i].push(jaccard_vector_index(data[i], data[j]));
        }

        T.initDataRaw(data);
        /* T.initDataDist(dist_matrix); */

        for(var k = 0; k < 500; k++) {
           T.step();
        }

        var Y = T.getSolution();

        var datasets = [];
        for (var i = 0; i <= pairs[pairs.length-1][1]; i++) {
            datasets.push({
                label: 'Cluster ' + i,
                fill: false,
                showLine: false,
                pointBackgroundColor: i < POINT_COLORS.length ? POINT_COLORS[i] : 'black',
                backgroundColor: i < POINT_COLORS.length ? POINT_COLORS[i] : 'black',
                data: []
            });
        }

        for (var i = 0; i < pairs.length; i++) {
            datasets[pairs[i][1]].data.push({x: Y[i][0], y: Y[i][1]});
        }

        var ctx = document.getElementById('tsnecanvas').getContext('2d');
        var scatterChart = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: datasets
            },
            options: {
                title: {
                    display: true,
                    text: 'Vizualization of vectors of bag of words using t-SNE algorithm in 2D'
                },
                tooltips: {
                    mode: 'label',
                    position: 'nearest',
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return CLUSTERS[tooltipItems.datasetIndex].items[tooltipItems.index].user +
                                   ' (' + CLUSTERS[tooltipItems.datasetIndex].items[tooltipItems.index].hostname + ')';
                        }
                    }
                },
            }
        });
    }
});

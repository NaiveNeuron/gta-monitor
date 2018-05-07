var POINT_COLORS = [
    'red', 'blue', 'green', 'orange', 'purple', 'lightgreen', 'lightblue',
    'magenta', 'brown', 'grey'
]

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

        T.initDataDist(DIST_MATRIX);

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
                    text: 'Vizualization of vectors of bag of words in 2D using t-SNE algorithm'
                },
                tooltips: {
                    mode: 'single',
                    position: 'nearest',
                    callbacks: {
                        label: function (tooltipItems, data) {
                            return CLUSTERS[tooltipItems.datasetIndex].items[tooltipItems.index].user +
                                   ' (' + CLUSTERS[tooltipItems.datasetIndex].items[tooltipItems.index].hostname + ')' +
                                   ' $ ' + CLUSTERS[tooltipItems.datasetIndex].items[tooltipItems.index].command;
                        }
                    }
                }
            }
        });
    }
});

var expParams;

function initialisePlot(domElement, expParams) {
    Plotly.newPlot(domElement, [{ x: [0] }], { margin: { t: 0 } }, { modeBarButtonsToRemove: ['sendDataToCloud'], showLink: false, displaylogo: false });
    Plotly.deleteTraces(domElement, 0);
    this.expParams = expParams;
};

function addData(domElement, data) {
    var plotDataArray = [];
    for (var j = 0; j < expParams.AINames.length; j++) {
        var tempArray = [];
        for (var i = 0; i < data.length; i++) {
            tempArray.push(data[i][expParams.AINames[j]]);
        }
        plotDataArray[j] = tempArray;
    }
    //Convention: the first element is always the x-axis. mapping the plot function on the others. Note the weird index assignment for slice.
    plotDataArray.slice(1, plotDataArray.length + 1).map(function(d) {
        Plotly.addTraces(document.getElementById("plot"), [{ x: plotDataArray[0], y: d }]);
    });
};

function deleteData(domElement) {
    var numberOfTracesToDelete = expParams.AINames.length - 1;
    var traceIndicesToDelete = []; //prepping for update
    //Note the convention that the first 'name' is always the x-axis. Not a trace!
    for (var j = -(numberOfTracesToDelete); j < 0; j++) { //quirky indices for the deletion to happen in right order
        traceIndicesToDelete.push(j);
    }
    Plotly.deleteTraces(domElement, traceIndicesToDelete);

};

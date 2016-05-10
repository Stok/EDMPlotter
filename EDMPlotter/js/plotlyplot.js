function initialisePlot(domElement) {
    Plotly.newPlot(domElement, [{ x: [0] }], { margin: { t: 0 } }, { modeBarButtonsToRemove: ['sendDataToCloud'], showLink: false, displaylogo: false });
    Plotly.deleteTraces(domElement, 0);
}

function addData(domElement, data, visibility) {
    Plotly.addTraces(domElement, data);
    Plotly.
}

function deletePreviousData(domElement, numberOfTracesToDelete) {
    var traceIndicesToDelete = []; //prepping for update
    //Note the convention that the first 'name' is always the x-axis. Not a trace!
    for (var j = -(numberOfTracesToDelete); j < 0; j++) { //quirky indices for the deletion to happen in right order
        traceIndicesToDelete.push(j);
    }
    Plotly.deleteTraces(domElement, traceIndicesToDelete);
}

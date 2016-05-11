var expParams, chart;

function initialisePlot(domElement, expParams) {

    this.expParams = expParams;
    //this.chart = function() {
    //    var chart = nv.models.lineChart()
    //        .margin({ left: 100 }) //Adjust chart margins to give the x-axis some breathing room.
    //        .useInteractiveGuideline(true) //We want nice looking tooltips and a guideline!
    //        .duration(350) //how fast do you want the lines to transition?  http://stackoverflow.com/questions/30455485/transitionduration-function-does-not-exist-in-nvd3-js
    //        .showLegend(true) //Show the legend, allowing users to turn on/off line series.
    //        .showYAxis(true) //Show the y-axis
    //        .showXAxis(true); //Show the x-axis
//
//
  //      chart.xAxis //Chart x-axis settings
   //         .axisLabel(expParams.AINames[0])
    //        .tickFormat(d3.format(',r'));
//
//        chart.yAxis //Chart y-axis settings
//            .axisLabel('AI (V)')
//            .tickFormat(d3.format('.02f'));
//
//        /* Done setting the chart up? Time to render it!*/
//        /*
//        var data = [{ values: { x: 0, y: 0 }, key: 'init', color: '#AARRGGBB' }]; //You need data...

//        d3.select(domElement) //Select the <svg> element you want to render the chart in.   
//            .datum(data) //Populate the <svg> element with chart data...
//            .call(chart); //Finally, render the chart!

        //Update the chart when window resizes.
////        nv.utils.windowResize(function() { chart.update() });*/
     //   return chart;
   // };
    /*These lines are all chart setup.  Pick and choose which chart features you want to utilize. */
   // nv.addGraph(chart);
};


function addData(domElement, data) {

    var plotDataArray = [];
    for (var j = 1; j < expParams.AINames.length; j++) {
        var tempArray = [];
        for (var i = 0; i < data.length; i++) {
            tempArray.push({ x: data[0][expParams.AINames[j]], y: data[i][expParams.AINames[j]] });
        }
        plotDataArray[j] = tempArray;
    }

    var colors = d3.scale.category10();

    var final_data = [];

    for (var i = 0; i < plotDataArray.length; i++) {
        final_data.push({ values: plotDataArray[i], key: expParams.AINames[i + 1], color: colors[i] });
    }

    nv.addGraph({
        generate: function() {
            var width = nv.utils.windowSize().width - 40,
                height = nv.utils.windowSize().height - 40;
            var chart = nv.models.line()
                .width(width)
                .height(height)
                .margin({ top: 20, right: 20, bottom: 20, left: 20 });
            chart.dispatch.on('renderEnd', function() {
                console.log('render complete');
            });
            d3.select(domElement)
                .attr('width', width)
                .attr('height', height)
                .datum(final_data)
                .call(chart);
            return chart;
        },
        callback: function(graph) {
            window.onresize = function() {
                var width = nv.utils.windowSize().width - 40,
                    height = nv.utils.windowSize().height - 40,
                    margin = graph.margin();
                if (width < margin.left + margin.right + 20)
                    width = margin.left + margin.right + 20;
                if (height < margin.top + margin.bottom + 20)
                    height = margin.top + margin.bottom + 20;
                graph.width(width).height(height);
                d3.select(domElement)
                    .attr('width', width)
                    .attr('height', height)
                    .call(graph);
            };
        }
    });







    //d3.select(domElement) //Select the <svg> element you want to render the chart in.   
    //   .datum(final_data) //Populate the <svg> element with chart data...
    //   .call(chart); //Finally, render the chart!

    //Update the chart when window resizes.
    //nv.utils.windowResize(function() { chart.update() });

}

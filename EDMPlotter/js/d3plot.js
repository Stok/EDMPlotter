//Feed it the div object, and the json data, 
//and it plots the function.
//Requires d3js. Make sure you load the following in your html file:
//<script charset="UTF-8" type="text/javascript" src="https://d3js.org/d3.v3.min.js">
//</script>
//

function plotData(svgId, data) { 

d3.select("svg > *").remove();

var margin = {top: 20, right: 20, bottom: 30, left: 70},
    width = 1000 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x = d3.scale.linear()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

x.domain(d3.extent(data, function(d) { return d.x_val; }));
y.domain(d3.extent(data, function(d) { return d.y_val; }));

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left");

var lineGen = d3.svg.line()
    .x(function(d) { return x(d.x_val); })
    .y(function(d) { return y(d.y_val); })
    .interpolate("linear");

var svg = d3.select(svgId)
.append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

 svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
    .append("text")
      .attr("x", width)
      .attr("dy", "-0.71em")
      .style("text-anchor", "end")
      .text("x_val");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .style("text-anchor", "end")
      .text("y_val");

  svg.append("path")
      .attr("d", lineGen(data))
      .attr("stroke", "green")
      .attr("stroke-width", 2)
      .attr("fill", "none");

    }

    function clearData() {
      d3.select("svg > *").remove();
    }

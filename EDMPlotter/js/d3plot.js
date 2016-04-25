//Feed it the div object, and the json data, 
//and it plots the function.
//Requires d3js. Make sure you load the following in your html file:
//<script charset="UTF-8" type="text/javascript" src="https://d3js.org/d3.v3.min.js">
//</script>
//

function plotData(svgId, data) { 

d3.select("svg > *").remove();

var margin = {top: 20, right: 200, bottom: 100, left: 50},
    margin2 = { top: 430, right: 10, bottom: 20, left: 40 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    height2 = 500 - margin2.top - margin2.bottom;

var bisectx_val = d3.bisector(function(d) { return d.x_val; }).left;

var xScale = d3.scale.linear()
    .range([0, width]);

var xScale2 = d3.scale.linear()
    .range([0, width]);

var yScale = d3.scale.linear()
    .range([height, 0]);

// 40 Custom DDV colors 
var color =  d3.scale.category10();//d3.scale.ordinal().range(["#48A36D", "#7EC4CF", "#DFB95C", "#D76D8F", "#809ECE", "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6",  "#7FBBCF", "#7FB1CF", "#80A8CE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F",  "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom"),

    xAxis2 = d3.svg.axis() // xAxis for brush slider
    .scale(xScale2)
    .orient("bottom"); 

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var line = d3.svg.line()
    .x(function(d) { return xScale(d.x_val); })
    .y(function(d) { return yScale(d.y_val); })
    .interpolate("linear")
    .defined(function(d) { return d.y_val; });

var maxY;
var minY;

var svg = d3.select(svgId).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create invisible rect for mouse tracking
svg.append("rect")
    .attr("width", width)
    .attr("height", height)                                    
    .attr("x", 0) 
    .attr("y", 0)
    .attr("id", "mouse-tracker")
    .style("fill", "white"); 

//for slider part-----------------------------------------------------------------------------------
  
var context = svg.append("g") // Brushing context box container
    .attr("transform", "translate(" + 0 + "," + 410 + ")")
    .attr("class", "context");

//append clip path for lines plotted, hiding those part out of bounds
svg.append("defs")
  .append("clipPath") 
    .attr("id", "clip")
    .append("rect")
    .attr("width", width)
    .attr("height", height); 

//end slider part----------------------------------------------------------------------------------- 

function updatePlot(data) { 
  color.domain(d3.keys(data[0]).filter(function(key) { // Set the domain of the color ordinal scale to be all the csv headers except "x_val", matching a color to an issue
    return key !== "x_val"; 
  }));

  var categories = color.domain().map(function(name) { // Nest the data into an array of objects with new keys

    return {
      name: name, // "name": the csv headers except x_val
      values: data.map(function(d) { // "values": which has an array of the x_vals and y_vals
        return {
          x_val: d.x_val, 
          y_val: +(d[name]),
          };
      }),
      visible: (name === "y_val" ? true : false) // "visible": all false except for economy which is true.
    };
  });

xScale.domain(d3.extent(data, function(d) { return d.x_val; }));

yScale.domain(d3.extent(data, function(d) { return d.y_val; }));

xScale2.domain(xScale.domain());

//for slider part-----------------------------------------------------------------------------------

 var brush = d3.svg.brush()//for slider bar at the bottom
    .x(xScale2) 
    .on("brush", brushed);

context.append("g") // Create brushing xAxis
      .attr("class", "x axis1")
      .attr("transform", "translate(0," + height2 + ")")
      .call(xAxis2);

  var contextArea = d3.svg.area() // Set attributes for area chart in brushing context graph
    .interpolate("monotone")
    .x(function(d) { return xScale2(d.x_val); }) // x is scaled to xScale2
    .y0(height2) // Bottom line begins at height2 (area chart not inverted) 
    .y1(0); // Top line of area, 0 (area chart not inverted)

  //plot the rect as the bar at the bottom
  context.append("path") // Path is created using svg.area details
    .attr("class", "area")
    .attr("d", contextArea(categories[0].values)) // pass first categories data .values to area path generator 
    .attr("fill", "#F1F1F2");
    
  //append the brush for the selection of subsection  
  context.append("g")
    .attr("class", "x brush")
    .call(brush)
    .selectAll("rect")
    .attr("height", height2) // Make brush rects same height 
      .attr("fill", "#E6E7E8");  
//end slider part-----------------------------------------------------------------------------------

// draw line graph
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)      
      .append("text")
        .attr("x",  width)
        .attr("dy", "-.71em")
        .style("text-anchor", "end")
        .text("x_val");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("x", -10)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("y_vals");

  var issue = svg.selectAll(".issue")
      .data(categories) // Select nested data and append to new svg group elements
    .enter().append("g")
      .attr("class", "issue");

  issue.append("path")
      .attr("class", "line")
      .style("pointer-events", "none") // Stop line interferring with cursor
      .attr("id", function(d) {
        return "line-" + d.name.replace(" ", "").replace("/", ""); // Give line id of line-(insert issue name, with any spaces replaced with no spaces)
      })
      .attr("d", function(d) { 
        return d.visible ? line(d.values) : null; // If array key "visible" = true then draw line, if not then don't 
      })
      .attr("clip-path", "url(#clip)")//use clip path to make irrelevant part invisible
      .style("stroke", function(d) { return color(d.name); });

// draw legend
  var legendSpace = 450 / categories.length; // 450/number of issues (ex. 40)    

  issue.append("rect")
      .attr("width", 10)
      .attr("height", 10)                                    
      .attr("x", width + (margin.right/3) - 15) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) - 8; })  // spacing
      .attr("fill",function(d) {
        return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
      })
      .attr("class", "legend-box")

      .on("click", function(d){ // On click make d.visible 
        d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

        maxY = findMaxY(categories); // Find max Y y_val value categories data with "visible"; true
        minY = findMinY(categories);
        yScale.domain([minY,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
        svg.select(".y.axis")
          .transition()
          .call(yAxis);   

        issue.select("path")
          .transition()
          .attr("d", function(d){
            return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
          })

        issue.select("rect")
          .transition()
          .attr("fill", function(d) {
          return d.visible ? color(d.name) : "#F1F1F2";
        });
      })

      .on("mouseover", function(d){

        d3.select(this)
          .transition()
          .attr("fill", function(d) { return color(d.name); });

        d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
          .transition()
          .style("stroke-width", 2.5);  
      })

      .on("mouseout", function(d){

        d3.select(this)
          .transition()
          .attr("fill", function(d) {
          return d.visible ? color(d.name) : "#F1F1F2";});

        d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
          .transition()
          .style("stroke-width", 1.5);
      })
      
  issue.append("text")
      .attr("x", width + (margin.right/3)) 
      .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace); })  // (return (11.25/2 =) 5.625) + i * (5.625) 
      .text(function(d) { return d.name; }); 

// Hover line 
  var hoverLineGroup = svg.append("g") 
            .attr("class", "hover-line");

  var hoverLine = hoverLineGroup // Create line with basic attributes
        .append("line")
            .attr("id", "hover-line")
            .attr("x1", 10).attr("x2", 10) 
            .attr("y1", 0).attr("y2", height + 10)
            .style("pointer-events", "none") // Stop line interferring with cursor
            .style("opacity", 1e-6); // Set opacity to zero 

  var hoverXData = hoverLineGroup
        .append('text')
            .attr("class", "hover-text")
            .attr("y", height - (height-40)) // hover x_val text position
            .attr("x", width - 150) // hover x_val text position
            .style("fill", "#000000");

  var columnNames = d3.keys(data[0]) //grab the key values from your first data row
                                     //these are the same as your column names
                  .slice(1); //remove the first column name (`x_val`);

  var focus = issue.select("g") // create group elements to house tooltip text
      .data(columnNames) // bind each column name x_val to each g element
    .enter().append("g") //create one <g> for each columnName
      .attr("class", "focus"); 

  focus.append("text") // http://stackoverflow.com/questions/22064083/d3-js-multi-series-chart-with-y-value-tracking
        .attr("class", "tooltip")
        .attr("x", width + 20) // position tooltips  
        .attr("y", function (d, i) { return (legendSpace)+i*(legendSpace) + 20; }); // (return (11.25/2 =) 5.625) + i * (5.625) // position tooltips       

  // Add mouseover events for hover line.
  d3.select("#mouse-tracker") // select chart plot background rect #mouse-tracker
  .on("mousemove", mousemove) // on mousemove activate mousemove function defined below
  .on("mouseout", function() {
      hoverXData
          .text(null) // on mouseout remove text for hover x_val

      d3.select("#hover-line")
          .style("opacity", 1e-6); // On mouse out making line invisible
  });

  function mousemove() { 
      var mouse_x = d3.mouse(this)[0]; // Finding mouse x position on rect
      var graph_x = Math.round(1000 * xScale.invert(mouse_x)) / 1000; // 

      //var mouse_y = d3.mouse(this)[1]; // Finding mouse y position on rect
      //var graph_y = yScale.invert(mouse_y);
      //console.log(graph_x);
      
  
      //var format = d3.time.format('%b %Y'); // Format hover x_val text to show three letter month and full year
    
      hoverXData.text(graph_x); // scale mouse position to xScale to show x_val
      
      d3.select("#hover-line") // select hover-line and changing attributes to mouse position
          .attr("x1", mouse_x) 
          .attr("x2", mouse_x)
          .style("opacity", 1); // Making line visible

      // Legend tooltips // http://www.d3noob.org/2014/07/my-favourite-tooltip-method-for-line.html

      var x0 = xScale.invert(d3.mouse(this)[0]), /* d3.mouse(this)[0] returns the x position on the screen of the mouse. xScale.invert function is reversing the process that we use to map the domain (x_val) to range (position on screen). So it takes the position on the screen and converts it into an equivalent x_val! */
      i = bisectx_val(data, x0, 1), // use our bisectx_val function that we declared earlier to find the index of our data array that is close to the mouse cursor
      /*It takes our data array and the x_val corresponding to the position of or mouse cursor and returns the index number of the data array which has a x_val that is higher than the cursor position.*/
      d0 = data[i - 1],
      d1 = data[i],
      /*d0 is the combination of x_val and y_val that is in the data array at the index to the left of the cursor and d1 is the combination of x_val and close that is in the data array at the index to the right of the cursor. In other words we now have two variables that know the value and x_val above and below the x_val that corresponds to the position of the cursor.*/
      d = x0 - d0.x_val > d1.x_val - x0 ? d1 : d0;
      /*The final line in this segment declares a new array d that is represents the x_val and close combination that is closest to the cursor. It is using the magic JavaScript short hand for an if statement that is essentially saying if the distance between the mouse cursor and the x_val and close combination on the left is greater than the distance between the mouse cursor and the x_val and close combination on the right then d is an array of the x_val and close on the right of the cursor (d1). Otherwise d is an array of the x_val and close on the left of the cursor (d0).*/
      //d is now the data row for the x_val closest to the mouse position

      focus.select("text").text(function(columnName){
         //because you didn't explictly set any data on the <text>
         //elements, each one inherits the data from the focus <g>

         return (d[columnName]);
      });
  }; 

  //for brusher of the slider bar at the bottom
  function brushed() {

    xScale.domain(brush.empty() ? xScale2.domain() : brush.extent()); // If brush is empty then reset the Xscale domain to default, if not then make it the brush extent 

    svg.select(".x.axis") // replot xAxis with transition when brush used
          .transition()
          .call(xAxis);

    maxY = findMaxY(categories); // Find max Y y_val value categories data with "visible"; true
    minY = findMinY(categories); // Find min Y y_val value categories data with "visible"; true
    yScale.domain([minY,maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
    
    svg.select(".y.axis") // Redraw yAxis
      .transition()
      .call(yAxis);   

    issue.select("path") // Redraw lines based on brush xAxis scale and domain
      .transition()
      .attr("d", function(d){
          return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
      });
    
  };      
};
updatePlot(data);
//}); // End Data callback function
  
  function findMaxY(data){  // Define function "findMaxY"
    var maxYValues = data.map(function(d) { 
      if (d.visible){
        return d3.max(d.values, function(value) { // Return max y_val value
          return value.y_val; })
      }
    });
    return d3.max(maxYValues);
  }

    function findMinY(data){  // Define function "findMinY"
    var minYValues = data.map(function(d) { 
      if (d.visible){
        return d3.min(d.values, function(value) { // Return min y_val value
          return value.y_val; })
      }
    });
    return d3.min(minYValues);
  }



};

function clearData() {
    d3.select("svg > *").remove();
}

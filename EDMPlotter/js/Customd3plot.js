var expParams;
var svg, ;

function initialisePlot(domElement, expParams) {
    var margin = { top: 20, right: 200, bottom: 100, left: 50 },
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;


    var xScale = d3.scale.linear()
        .range([0, width]);


    var yScale = d3.scale.linear()
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient("bottom");


    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient("left");

    var line = d3.svg.line()
        .x(function(d) {
            return xScale(d.x_val);
        })
        .y(function(d) {
            return yScale(d.y_val);
        })
        .interpolate("linear")
        .defined(function(d) {
            return d.y_val;
        });

    var maxY;
    var minY;

    var svg = d3.select(domElement).append("svg")
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

};

function addData(domElement, data) {

    var color = d3.scale.category10(); //d3.scale.ordinal().range(["#48A36D", "#7EC4CF", "#DFB95C", "#D76D8F", "#809ECE", "#56AE7C",  "#64B98C", "#72C39B", "#80CEAA", "#80CCB3", "#7FC9BD", "#7FC7C6",  "#7FBBCF", "#7FB1CF", "#80A8CE", "#8897CE", "#8F90CD", "#9788CD", "#9E81CC", "#AA81C5", "#B681BE", "#C280B7", "#CE80B0", "#D3779F",  "#DC647E", "#E05A6D", "#E16167", "#E26962", "#E2705C", "#E37756", "#E38457", "#E39158", "#E29D58", "#E2AA59", "#E0B15B", "#DDC05E", "#DBC75F", "#E3CF6D", "#EAD67C", "#F2DE8A"]);  

    color.domain(d3.keys(data[0]).filter(function(key) { // Set the domain of the color ordinal scale to be all the csv headers except "x_val", matching a color to an input
        return key !== "x_val";
    }));
    //Mapping over the colours insead of the data because the colours already eliminated the xaxis.
    var categories = color.domain().map(function(name) { // Nest the data into an array of objects with new keys
        return {
            name: name, // "name": the csv headers except x_val
            values: data.map(function(d) { // "values": which has an array of the x_vals and y_vals
                return {
                    x_val: d.x_val,
                    y_val: +(d[name]),
                };
            }),
            visible: true //(name === "f1" ? true, false) // "visible": all false except for f1
        };
    });

    xScale.domain(d3.extent(data, function(d) {
        return d.x_val;
    }));

    maxY = findMaxY(categories); // Find max Y y_val value categories data with "visible"; true
    minY = findMinY(categories);
    yScale.domain([minY, maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
    svg.select(".y.axis")
        .transition()
        .call(yAxis);

    // draw line graph
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("x", width)
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
        .attr("clip-path", "url(#clip)") //use clip path to make irrelevant part invisible
        .style("stroke", function(d) {
            return color(d.name);
        });

    // draw legend
    var legendSpace = 450 / categories.length; // 450/number of issues (ex. 40)    

    issue.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("x", width + (margin.right / 3) - 15)
        .attr("y", function(d, i) {
            return (legendSpace) + i * (legendSpace) - 8;
        }) // spacing
        .attr("fill", function(d) {
            return d.visible ? color(d.name) : "#F1F1F2"; // If array key "visible" = true then color rect, if not then make it grey 
        })
        .attr("class", "legend-box")

    .on("click", function(d) { // On click make d.visible 
        d.visible = !d.visible; // If array key for this data selection is "visible" = true then make it false, if false then make it true

        maxY = findMaxY(categories); // Find max Y y_val value categories data with "visible"; true
        minY = findMinY(categories);
        yScale.domain([minY, maxY]); // Redefine yAxis domain based on highest y value of categories data with "visible"; true
        svg.select(".y.axis")
            .transition()
            .call(yAxis);

        issue.select("path")
            .transition()
            .attr("d", function(d) {
                return d.visible ? line(d.values) : null; // If d.visible is true then draw line for this d selection
            })

        issue.select("rect")
            .transition()
            .attr("fill", function(d) {
                return d.visible ? color(d.name) : "#F1F1F2";
            });
    })

    .on("mouseover", function(d) {

        d3.select(this)
            .transition()
            .attr("fill", function(d) {
                return color(d.name);
            });

        d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
            .transition()
            .style("stroke-width", 2.5);
    })

    .on("mouseout", function(d) {

        d3.select(this)
            .transition()
            .attr("fill", function(d) {
                return d.visible ? color(d.name) : "#F1F1F2";
            });

        d3.select("#line-" + d.name.replace(" ", "").replace("/", ""))
            .transition()
            .style("stroke-width", 1.5);
    })

    issue.append("text")
        .attr("x", width + (margin.right / 3))
        .attr("y", function(d, i) {
            return (legendSpace) + i * (legendSpace);
        }) // (return (11.25/2 =) 5.625) + i * (5.625) 
        .text(function(d) {
            return d.name;
        });


};

function deleteData(domElement) {

};


//}); // End Data callback function

function findMaxY(data) { // Define function "findMaxY"
    var maxYValues = data.map(function(d) {
        if (d.visible) {
            return d3.max(d.values, function(value) { // Return max y_val value
                return value.y_val;
            })
        }
    });
    return d3.max(maxYValues);
}

function findMinY(data) { // Define function "findMinY"
    var minYValues = data.map(function(d) {
        if (d.visible) {
            return d3.min(d.values, function(value) { // Return min y_val value
                return value.y_val;
            })
        }
    });
    return d3.min(minYValues);
}

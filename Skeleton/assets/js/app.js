// D3 Scatterplot Assignment

// Students:
// =========
// Follow your written instructions and create a scatter plot with D3.js.
d3.select(window).on("resize", makeResponsive);

makeResponsive();

function makeResponsive() {

    // if the SVG area isn't empty when the browser loads,
    // remove it and replace it with a resized version of the chart
    var svgArea = d3.select("body").select("svg");

    if (!svgArea.empty()) {
    svgArea.remove();
    }

    // svg params
    var svgHeight = window.innerHeight;
    var svgWidth = window.innerWidth;

    // margins
    var margin = {
    top: 100,
    right: 100,
    bottom: 100,
    left: 100
    };

    // chart area minus margins
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    // create svg container
    var svg = d3.select(".chart").append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // shift everything over by the margins
    var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Initial Params
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // Retrieve data from the CSV file and execute everything below
    d3.csv("data/data.csv", function(err, stateData) {
        if (err) throw err;
    
        // parse data //turns strings to ints
        stateData.forEach(d=> {
            d.poverty = +d.poverty;
            d.age = +d.age;
            d.income = +d.income;
            d.obesity = +d.obesity;
            d.smokes = +d.smokes; 
            d.healthcare = +d.healthcare;
        });
    
        // xLinearScale function above csv import
        var xLinearScale = axisScale(stateData, chosenXAxis, width, height, true);
    
        // Create y scale function
        var yLinearScale = axisScale(stateData, chosenYAxis, width, height, false);
    
        // Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);
    
        // append x axis
        var xAxis = chartGroup.append("g")
            .classed("x-axis", true)
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);
    
        // append y axis
        var yAxis =chartGroup.append("g")
            .classed("y-axis", true)
            .call(leftAxis);
    
        // append initial circles
        var circlesGroup = chartGroup.append("g")
            .classed("circles", true)
            .selectAll("circle")
            .data(stateData)
            .enter()
            .append("circle")
            .attr("cx", d => xLinearScale(d[chosenXAxis]))
            .attr("cy", d => yLinearScale(d[chosenYAxis]))
            .attr("text", d => d.abbr)
            .attr("r", 20)
            .attr("fill", "lightblue");

        // adds initial abbreviations to circles
        var abbrGroup = chartGroup.append("g")
            .classed("abbr", true)
            .selectAll("text")
            .data(stateData)
            .enter()
            .append("text")
            .attr("x", d => xLinearScale(d[chosenXAxis]))
            .attr("y", d => yLinearScale(d[chosenYAxis]))
            .attr("fill", "white")
            .style("text-anchor", "middle")
            .style("alignment-baseline","middle")
            .text(d => d.abbr)

        ///////////////////////////////////////
        // add tooltips for each abbr in circle
        abbrGroup = updateToolTip(chosenXAxis, chosenYAxis, abbrGroup);

        /////////////////////////////////////
        // Create group for  3 x- axis labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);
    
        var xPovertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value to grab for event listener
            .classed("active", true)
            .classed("default", true)
            .text("In Poverty (%)");
    
        var xAgeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value to grab for event listener
            .classed("default", true)
            .text("Age (Median)");

        var xIncomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value to grab for event listener
            .classed("default", true)
            .text("Household Income (Median)");
        
    
        /////////////////////////////////////
        // Create group for  3 y- axis labels
        var yLabelsGroup = chartGroup.append("g");
    
        var yObesityLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left+20)
            .attr("x", 0 - (height / 2))
            .attr("value", "obesity") // value to grab for event listener
            .classed("active", true)
            .classed("default", true)
            .attr("transform", "rotate(-90)")
            .text("Obese (%)");
    
        var ySmokesLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left+40)
            .attr("x", 0 - (height / 2))
            .attr("value", "smokes") // value to grab for event listener
            .classed("default", true)
            .attr("transform", "rotate(-90)")
            .text("Smokes (%)");

        var yHealthcareLabel = yLabelsGroup.append("text")
            .attr("y", 0 - margin.left+60)
            .attr("x", 0 - (height / 2))
            .attr("value", "healthcare") // value to grab for event listener
            .classed("default", true)
            .attr("transform", "rotate(-90)")
            .text("Lacks Healthcare (%)");
    
        ///////////////////////////////
        // x axis labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
    
                // replaces chosenXAxis with value
                chosenXAxis = value;
        
        
                // updates x scale for new data
                xLinearScale = axisScale(stateData, chosenXAxis, width, height, true);
        
                // updates x axis with transition
                xAxis = renderAxes(xLinearScale, xAxis, true);
        
                // updates circles with new x values
                circlesGroup = renderGroup(circlesGroup, xLinearScale, chosenXAxis,"cx");
                abbrGroup = renderGroup(abbrGroup, xLinearScale, chosenXAxis,"x");
        
                // updates tooltips with new info
                abbrGroup = updateToolTip(chosenXAxis, chosenYAxis, abbrGroup);
            
                // changes classes to change bold text
                switch (chosenXAxis)
                { 
                    case "poverty":
                        xPovertyLabel.classed("active", true);
                        xAgeLabel.classed("active", false);
                        xIncomeLabel.classed("active", false);
                        break;
                    case "age":
                        xPovertyLabel.classed("active", false);
                        xAgeLabel.classed("active", true);
                        xIncomeLabel.classed("active", false);
                        break;
                    case "income":
                        xPovertyLabel.classed("active", false);
                        xAgeLabel.classed("active", false);
                        xIncomeLabel.classed("active", true);
                }
            }
        });

        ////////////////////////////////
        // y axis labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {
            // get value of selection
            
            var value = d3.select(this).attr("value");
           
            if (value !== chosenYAxis) {
    
                // replaces chosenYAxis with value
                chosenYAxis = value;
        
        
                // updates y scale for new data
                yLinearScale = axisScale(stateData, chosenYAxis, width, height, false);
        
                // updates y axis with transition
                yAxis = renderAxes(yLinearScale, yAxis, false);
        
                // updates circles with new y values
                circlesGroup = renderGroup(circlesGroup, yLinearScale, chosenYAxis,"cy");
                abbrGroup = renderGroup(abbrGroup, yLinearScale, chosenYAxis,"y");
        
                // updates tooltips with new info
                abbrGroup = updateToolTip(chosenXAxis, chosenYAxis, abbrGroup);
        
            
                // changes classes to change bold text
                switch (chosenYAxis)
                { 
                    case "obesity":
                        yObesityLabel.classed("active", true);
                        ySmokesLabel.classed("active", false);
                        yHealthcareLabel.classed("active", false);
                        break;
                    case "smokes":
                        yObesityLabel.classed("active", false);
                        ySmokesLabel.classed("active", true);
                        yHealthcareLabel.classed("active", false);
                        break;
                    case "healthcare":
                        yObesityLabel.classed("active", false);
                        ySmokesLabel.classed("active", false);
                        yHealthcareLabel.classed("active", true);
                }
            }
        });

    });
  
}




// function used for updating x-scale var upon click on axis label
function axisScale(stateData, chosenAxis, width, height, flag) ///flag == true (x-axis)
{
    // create scales
    var linearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenAxis]) * 0.8,
            d3.max(stateData, d => d[chosenAxis]) * 1.2
    ])
    .range( (flag?[0, width]:[height, 0]) );

    return linearScale;

}

// function used for updating axis var upon click on axis label
function renderAxes(newScale, axis, flag)  ///flag == true (x-axis)
{
  
    var newAxis = flag ? d3.axisBottom(newScale) : d3.axisLeft(newScale);  //if flag is true axisBottom else axisLeft

    axis.transition()
        .duration(1000)
        .call(newAxis);

    return axis;
}

// function used for updating circles/abbr group with a transition to
// new circles/abbr    //abbr text uses x,y || while circles use cx,cy
function renderGroup(myGroup, newScale, chosenAxis, changedParam)  //changedParam can be (x,y,cx,cy)
{
        myGroup.transition()
            .duration(1000)
            .attr( changedParam, d => newScale(d[chosenAxis]));

    return myGroup;
}


// function used for updating abbreviation group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, abbrGroup) {
  
    var toolTip = d3.tip()
      .attr("class", "tooltip")
      .offset([80, -60])
      .html(d=> `${d.state}<br>${titleCase(chosenXAxis)}: ${d[chosenXAxis]}<br>${titleCase(chosenYAxis)}: ${d[chosenYAxis]}`);
      
  
    abbrGroup.call(toolTip);
  
    abbrGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });
  
    return abbrGroup;
}


/////////PYTHON TITLECASE FOR JS
function titleCase(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}
//Margin und Grössen des Visuals Treemap
var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1024 - margin.left - margin.right,
  height = 800 - margin.top - margin.bottom;


//Treemap data
var groupedData = null;

// set the dimensions and margins of the Barplot Visual Motortypebymake
var marginBP = {top: 100, right: 30, bottom: 70, left: 80},
widthBP = 600 - marginBP.left - marginBP.right,
heightBP = 600 - marginBP.top - marginBP.bottom;

// BPData on Click Update
var BPData = null;
var choosenmake = null;


// Append SVG Treemap
var svg = d3.select("#treeMapMake")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


// append the svg for BarPlot 
var svgBarMotorTypeByMake = d3.select("#BarMotorTypeByMake")
.append("svg")
  .attr("width", widthBP + marginBP.left + marginBP.right)
  .attr("height", heightBP + marginBP.top + marginBP.bottom)
.append("g")
  .attr("transform",
        "translate(" + marginBP.left + "," + marginBP.top + ")");


//Slider mit Standart Wert
var slider = document.getElementById("SliderRegistrationYear");
var output = document.getElementById("OutputSlider");
output.innerHTML = "Verkausjahr auf Autoscout24: "+slider.value;

//Title Bar Plot
var OutputTitleBP = document.getElementById("OutputTitleBP");
        

//Get Data / Transform Data in JS Objects und aufruf der Draw Visuals Funktionen
d3.csv("data/autoscout24-germany-dataset.csv", function(data) {

    drawVisuals(data);

});

//Draw All Visuals
function drawVisuals(data){



  select = d3.select("#SliderRegistrationYear");
      select.on("change", function () {
          const year = this.value;
          console.log("Selected year: " + year);
          output.innerHTML = "Jahr der Listung auf Autoscout24: "+this.value;
          groupedData = yearGroupedFilter(data, year);
          let filterdata = yearFilter(data, year);
         

          renderTreeMapMake(groupedData);
          renderScatterplot(filterdata);

          if (choosenmake==null) {
            renderBarPlotMotortypebyMake(data);
          }else{
            UpdateBarplotbyMake(choosenmake)
          }


          
      });
  let groupedData = yearGroupedFilter(data, slider.value);
  let filterdata = yearFilter(data, slider.value);

  renderTreeMapMake(groupedData);
  renderScatterplot(filterdata);

  renderBarPlotMotortypebyMake(data);

 
  }

  function BPMakeFilter(data, year){
    console.log("Original Objects", data);
    data = data.filter(function(d){ return d.year == year});
    data = data.filter(function(d){ return d.fuel == "Diesel" || d.fuel == "Gasoline" || d.fuel == "Electric" || d.fuel == "Electric/Gasoline"});

  var groupedData = d3.nest()
  .key(function(d) { return d.fuel; })
  .rollup(function(leaves) {
    return leaves.length
  })
  .entries(data);
  groupedData = groupedData.sort(function(a, b) { return b.value - a.value; })

  console.log("BP Motortype Data :", groupedData); 
  return groupedData;
  }


//Filterdata for Listenjahr, returns filterd and GroupedData (nach Marke gruppiert)
function yearGroupedFilter(data, year){
  
  

  data = data.filter(function(d){ return d.year == year});
  // Gruppiere die Daten nach der Marken-Spalte
  var groupedData = d3.nest()
  .key(function(d) { return d.make; })
  .rollup(function(leaves) {
    return leaves.length
  })
  .entries(data);

  console.log("normal :", groupedData); 
  groupedData = groupedData.sort(function(a, b) { return b.value - a.value; })

  console.log("GroupedData sorted :", groupedData); 
  groupedData = groupedData.slice(0,20);

        console.log("GroupedData Filtered:", groupedData); 
        
  return groupedData;
}


//Filterdata for Listenjahr, returns filterd data year
function yearFilter(data, year){
  
  console.log("Original Objects into year filter", data);

  data = data.filter(function(d){ return d.year == year});

  console.log("year filtered", data);
         
  return data;
}


//Darstellung des SVG TreeMap für Marke pro Verkauf
function renderTreeMapMake(groupedData){
  

    var treemap = d3.treemap()
      .size([width, height])
      .padding(5)
      .paddingOuter(3)
      .paddingTop(3)
      .paddingInner(1)
      .round(true);

    // Wende das Treemap-Layout auf die Daten an
    var root = d3.hierarchy({ children: groupedData })
    .sum(function(d) {
      return d.value;
    })
    .sort(function(a, b) { return b.value - a.value; }); // Sort nodes by value

    // Then d3.treemap computes the position of each element of the hierarchy
    // The coordinates are added to the root object above
    
    var leaves = treemap(root);
    console.log("Root after treemap", root);


    // use this information to add rectangles:
    // Erstelle Rechtecke für die Treemap-Darstellung
    var cell = svg.selectAll("g")
                  .data(leaves);

    var entering = cell.enter()
                  .append("g")

    entering.append("rect")
      .data(root.leaves())
      .enter()
      .append('rect')
      .attr('x', function(d) { return d.x0; })
      .attr('y', function(d) { return d.y0; })
      .attr('width', function(d) { return d.x1 - d.x0; })
      .attr('height', function(d) { return d.y1 - d.y0; })
      //.attr('fill', '#91bbff')
      .attr('stroke', 'white')
      .attr("fill", function (d) {
        if(d.data.key==choosenmake) {
           return "#36454F"; // Get fill of current item
        } else {
          return "#91bbff"
        }
      });

    entering.append("text")
      .data(root.leaves())
      .enter()
      .append('text')
      .attr("letter-spacing",0.5)
      .attr("font-weight",700)
      .attr('x', function(d) { return d.x0 + 5 })
      .attr('y', function(d) { return d.y0 + 20 })
      .attr("dy", "1.2em")
      .text(function(d) { return  d.data.key})
      .attr('fill', 'white');

    //Löscht allte Cells
    cell.exit().remove();
}       

//Event für Mousover Tooltip Tree Map
d3.selectAll("#treeMapMake")
.on("mousemove touchmove", createtooltipTreeMap);

d3.selectAll("#treeMapMake")
.on("mouseleave", hideTooltip);

//Display Tooltip Treemap
function createtooltipTreeMap() {
  var tooltip = d3.select(".tooltip");
  var tgt = d3.select(d3.event.target);

  var data = tgt.data()[0];

  if (typeof data === 'undefined') {
    
    tooltip
      .style("opacity", 0);
  } else {
    tooltip
      .style("opacity", 0.78)
      .style("left", (d3.event.pageX - tooltip.node().offsetWidth / 4) + "px")
      .style("top", (d3.event.pageY - tooltip.node().offsetHeight - 5) + "px");

    tooltip 
        .html(`
          <p><b>${data.data.key}</b></p>
          <p>Anzahl Verkäufe: ${data.value}</p>
        `);
  }
}


//Hide Tooltip Treemap
function hideTooltip() {
  var tooltip = d3.select(".tooltip");
    tooltip
      .style("opacity", 0);
}

function renderScatterplot(data){

var xScale = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return d.price; })])
  .range([0, width]);

var yScale = d3.scaleLinear()
  .domain([0, d3.max(data, function(d) { return d.mileage; })])
  .range([0, 200]);

  var svgScatterPlot = d3.select("#ScaterplotKmPrice");
  
  
svgScatterPlot.append("svg")
  .attr("width", width + margin.left + margin.right )
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

//Add Points to SVG ScatterPlot
svgScatterPlot.selectAll("circle").remove();

svgScatterPlot.selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("cx", function(d) { return xScale(d.price); })
  .attr("cy", function(d) { return yScale(d.mileage); })
  .attr("r", 5); // radius of circles
  
//remove g
svgScatterPlot.selectAll("g").remove();
// Add x-axis
svgScatterPlot.append("g")
  .attr("transform", "translate(0, "+height+")")
  .call(d3.axisBottom(xScale));

// Add y-axis
svgScatterPlot.append("g")
  .call(d3.axisLeft(yScale));

// Add labels
svgScatterPlot.append("text")
  .attr("transform", "translate("+width/2+", -6)")
  .text("Preis");

svgScatterPlot.append("text")
  .attr("transform", "rotate(-90)")
  .attr("y", height/2)
  .attr("x", 0)
  .text("Kilometerstand");

}


 //Event für Mouseclick Tree Map Marke
 d3.select("#treeMapMake")
 .on("click", HandleClickTreemap);


//Update Bar Plot (after Click)
function HandleClickTreemap() {

  console.log("Clik Event",d3.event);
    var tgt = d3.select(d3.event.target);

  var data = tgt.data()[0];

  if (typeof data === 'undefined') {
    
  } else {

    if(choosenmake == data.data.key){
      //Deselect on Treemap
      choosenmake = null;
    }else{
      //Select on Treemap
      choosenmake = data.data.key;
    }

      
    if(choosenmake != null){
    OutputTitleBP.innerHTML = "Motor Vergleich : "+choosenmake;
      
    }else{
      OutputTitleBP.innerHTML = "Motor Vergleich : Alle Marken";
    }
      
      
      d3.csv("data/autoscout24-germany-dataset.csv", function(data) {

        BPData = data;

        let year = slider.value;
        groupedData = yearGroupedFilter(data, year);
        renderTreeMapMake(groupedData);


        if(choosenmake != null){
        UpdateBarplotbyMake(choosenmake);
        } else{
          renderBarPlotMotortypebyMake(data);
        }
        
      });
  }
}

function UpdateBarplotbyMake(choosenmake){

  BPData = BPData.filter(function(d){ return d.make == choosenmake});
  renderBarPlotMotortypebyMake(BPData);
}

function renderBarPlotMotortypebyMake(data){
  
  let year = slider.value;
  data =  BPMakeFilter(data, year);

  //Remove Visual Points from SVG Bar Plot
  svgBarMotorTypeByMake.selectAll("g").remove();
  svgBarMotorTypeByMake.selectAll("rect").remove();
  svgBarMotorTypeByMake.selectAll("text").remove();
  // X axis
  var xBP = d3.scaleBand()
  .range([ 0, widthBP ])
  .domain(data.map(function(d) { return d.key; }))
  .padding(0.2);
  svgBarMotorTypeByMake.append("g")
  .attr("transform", "translate(0," + heightBP + ")")
  .call(d3.axisBottom(xBP))


  // Add Y axis
  let maxY = d3.max(data, d => d.value);

  let TotalCount = data.reduce((accumulator, object) => {
    return accumulator + object.value;
  }, 0);
  console.log("TotalCount BP",TotalCount)

  var yBP = d3.scaleLinear()
  .domain([0, maxY])
  .range([ heightBP, 0]);
  svgBarMotorTypeByMake.append("g")
  .attr("class", "myYaxis")
  .call(d3.axisLeft(yBP));


 var u = svgBarMotorTypeByMake.selectAll("rect")
   .data(data)

 u
   .enter()
   .append("rect")
   .merge(u)
   .transition()
   .duration(500)
     .attr("x", function(d) { return xBP(d.key); })
     .attr("y", function(d) { return yBP(d.value); })
     .attr("width", xBP.bandwidth())
     .attr("height", function(d) { return heightBP - yBP(d.value); })
     .attr("fill", "#69b3a2")

  
  u
     .enter()
     .append("text")
     .text(function(d){return d.value+ " | "+((d.value/TotalCount)*100).toPrecision(2)+"%";})
     .attr("x", function(d) { return xBP(d.key)+xBP.bandwidth()/2;})
     .attr("y", function(d) { return yBP(d.value)-5;})
     .attr("text-anchor", "middle");
}







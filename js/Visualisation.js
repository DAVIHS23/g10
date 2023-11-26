var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1024 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#treeMapMake")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

var slider = document.getElementById("SliderRegistrationYear");
var output = document.getElementById("OutputSlider");
output.innerHTML = "Jahr der Listung auf Autoscout24: "+slider.value; // Display the default slider value
        


d3.csv("data/autoscout24-germany-dataset.csv", function(data) {

    drawTreeMap(data);
});


function drawTreeMap(data){

  select = d3.select("#SliderRegistrationYear");
      select.on("change", function () {
          const year = this.value;
          console.log("Selected year: " + year);
          output.innerHTML = "Jahr der Listung auf Autoscout24: "+this.value;
          let groupedData = TreeMapFilter(data, year);
          renderTreeMapMake(groupedData);
      });
  let groupedData = TreeMapFilter(data, slider.value);
  renderTreeMapMake(groupedData);
  }

function TreeMapFilter(data, year){
  
  console.log("Original Objects", data);

  data = data.filter(function(d){ return d.year == year});
  // Gruppiere die Daten nach der Kategorie-Spalte
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
        //console.log("ArrayData[0] :", groupedData[0]); 
        //console.log("ArrayData[1] :", groupedData[1]); 
  return groupedData;
}

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
      .attr('fill', '#91bbff')
      .attr('stroke', 'white');

    entering.append("text")
      .data(root.leaves())
      .enter()
      .append('text')
      .attr("letter-spacing",0.5)
      .attr("font-weight",700)
      .attr('x', function(d) { return d.x0 + 5 })
      .attr('y', function(d) { return d.y0 + 20 })
      .attr("dy", "1.2em")
      .text(function(d) { return  d.data.key+" "+d.value})
      .attr('fill', 'white');

    cell.exit().remove();


   /* svg.selectAll('rect')
      .data(root.leaves())
      .enter()
      .append('rect')
      .attr('x', function(d) { return d.x0; })
      .attr('y', function(d) { return d.y0; })
      .attr('width', function(d) { return d.x1 - d.x0; })
      .attr('height', function(d) { return d.y1 - d.y0; })
      .attr('fill', '#91bbff')
      .attr('stroke', 'white');
    
   


    svg.selectAll('text')
      .data(root.leaves())
      .enter()
      .append('text')
      .attr("letter-spacing",0.5)
      .attr("font-weight",700)
      .attr('x', function(d) { return d.x0 + 5 })
      .attr('y', function(d) { return d.y0 + 20 })
      .attr("dy", "1.2em")
      .text(function(d) { return  d.data.key+" "+d.value})
      .attr('fill', 'white');

      */
}       







//Tooltip für 
d3.selectAll("svg")
.on("mousemove touchmove", createtooltip);

function createtooltip() {
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
          <p>Anzahl Listungen: ${data.value}</p>
        `);
  }
}


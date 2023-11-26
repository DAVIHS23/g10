var margin = {top: 10, right: 10, bottom: 10, left: 10},
  width = 1024 - margin.left - margin.right,
  height = 900 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Read data
d3.csv("data/autoscout24-germany-dataset.csv", function(data) {

  console.log("Original Objects", data);

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
  
  treemap(root);
  console.log("Root after treemap", root);

  // use this information to add rectangles:
  // Erstelle Rechtecke für die Treemap-Darstellung
  svg.selectAll('rect')
    .data(root.leaves())
    .enter()
    .append('rect')
    .attr('x', function(d) { return d.x0; })
    .attr('y', function(d) { return d.y0; })
    .attr('width', function(d) { return d.x1 - d.x0; })
    .attr('height', function(d) { return d.y1 - d.y0; })
    .attr('fill', 'steelblue')
    .attr('stroke', 'white');
  
  // Füge Text für jede Kategorie hinzu
  svg.selectAll('text')
    .data(root.leaves())
    .enter()
    .append('text')
    .attr('x', function(d) { return d.x0 + 5 })
    .attr('y', function(d) { return d.y0 + 20 })
    .text(function(d) { return [d.data.key, `Count: ${d.value}`]; })
    .attr('fill', 'white');
})
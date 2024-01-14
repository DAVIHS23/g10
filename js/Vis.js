
// Definition der SVG-Größe und Margen
var marginbm = {top: 20, right: 30, bottom: 40, left: 90},
    widthbm = 700 - marginbm.left - marginbm.right,
    heightbm = 500 - marginbm.top - marginbm.bottom;

// SVG für Balkendiagramm erstellen
var svgmodel = d3.select("#ModelBarplot")
  .append("svg")
    .attr("width", widthbm + marginbm.left + marginbm.right)
    .attr("height", heightbm + marginbm.top + marginbm.bottom)
  .append("g")
    .attr("transform", "translate(" + marginbm.left + "," + marginbm.top + ")");

    

    d3.csv("data/autoscout24-germany-dataset.csv", function(databm) {
        let uniqueMakes = [...new Set(databm.map(item => item.make))]; // Einzigartige Marken
        uniqueMakes.sort(); // Alphabetisches Sortieren
    
        const dropdown = d3.select('#makedropdown'); // Zugriff auf das Dropdown-Element
        uniqueMakes.forEach(make => {
            dropdown.append('option').text(make).attr('data-value', make); // Hinzufügen jeder Marke als Option mit data-value
        });
    
        // Event Listener für das Dropdown-Menü hinzufügen
        dropdown.on('change', function() {
            let selectedOption = d3.select(this).select('option:checked');
            let selectedValue = selectedOption.attr('data-value'); // Auslesen des data-value Attributs
            console.log('Ausgewählte Marke:', selectedValue);
    
            updateBarPlotBM(selectedValue, databm); // Aufruf der Funktion zum Aktualisieren des Balkendiagramms
        });
    });
    

function updateBarPlotBM(selectedValue, databm) {
    // Löschen Sie vorherige Balken
    svgmodel.selectAll("*").remove();

    var filteredData = d3.nest()
        .key(function(p) { return p.model; })
        .rollup(function(w) { return w.length; })
        .entries(databm.filter(function(p) { return p.make === selectedValue; }));
    
    // X-Achse
    var x = d3.scaleBand()
        .range([0, widthbm])
        .domain(filteredData.map(function(p) { return p.key; }))
        .padding(0.1);
    svgmodel.append("g")
        .attr("transform", "translate(0," + heightbm + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
          .attr("transform", "translate(-10,0)rotate(-45)")
          .style("text-anchor", "end");

    // Y-Achse
    var y = d3.scaleLinear()
        .domain([0, d3.max(filteredData, function(p) { return p.value; })])
        .range([heightbm, 0]);
    svgmodel.append("g")
        .call(d3.axisLeft(y));

    // Balken
    svgmodel.selectAll("rect")
        .data(filteredData)
        .enter()
        .append("rect")
        .attr("x", function(p) { return x(p.key); })
        .attr("y", function(p) { return y(p.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(p) { return heightbm - y(p.value); })
        .attr("fill", "#4D8E9A");
}
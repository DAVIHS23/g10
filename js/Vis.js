var colorScale = d3.scaleOrdinal()
  .domain(["Gasoline", "Diesel", "Electric", "Electric/Diesel", "Electric/Gasoline"]) 
  .range(["#232D3F", "#176B87", "#005B41", "#CD5C08", "#CD5C08"]); 

//Slider mit Standart Wert
var slider_year = document.getElementById("SliderRegistrationYear2");
var output2 = document.getElementById("OutputSlider2");
output2.innerHTML = "Verkausjahr auf Autoscout24: "+slider_year.value;


// Definition der SVG-Größe und Margen
var marginbm = {top: 20, right: 30, bottom: 40, left: 90},
    widthbm = 1100 - marginbm.left - marginbm.right,
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
        
        const slider2 = d3.select("#SliderRegistrationYear2");
        const dropdown = d3.select('#makedropdown'); // Zugriff auf das Dropdown-Element
        uniqueMakes.forEach(make => {
            dropdown.append('option').text(make).attr('data-value', make); // Hinzufügen jeder Marke als Option mit data-value
        });
    
        // Event Listener für das Dropdown-Menü hinzufügen
        dropdown.on('change', function() {
            let selectedOption = d3.select(this).select('option:checked');
            let selectedValue = selectedOption.attr('data-value'); // Auslesen des data-value Attributs
            console.log('Ausgewählte Marke:', selectedValue);

        

        var modelEngineData = d3.nest()
        .key(function(n) { return n.model; })
        .key(function(n) { return n.fuel; })
        .rollup(function(leaves) { return leaves.length; })
        .entries(databm.filter(function(p) { return p.make === selectedValue && p.year === slider_year.value; }));
        console.log("yearr after dropdown", slider_year)    
        console.log("databm after dropdown",modelEngineData);
            updateBarPlotBM(selectedValue, modelEngineData); // Aufruf der Funktion zum Aktualisieren des Balkendiagramms
        });

        
        slider2.on("change", function () {
          const year = this.value;
          console.log("Selected year Slider 2: " + year);
          output2.innerHTML = "Jahr der Listung auf Autoscout24: "+year;
        
          let selectedOption = d3.select('#makedropdown').select('option:checked');
          let selectedValue = selectedOption.attr('data-value'); // Auslesen des data-value Attributs
          console.log('Ausgewählte Marke Slider:', selectedValue);

          var modelEngineData = d3.nest()
          .key(function(n) { return n.model; })
          .key(function(n) { return n.fuel; })
          .rollup(function(leaves) { return leaves.length; })
          .entries(databm.filter(function(p) { return p.make === selectedValue && p.year === year; }));
        
          console.log("databm after slider",modelEngineData);
          updateBarPlotBM(selectedValue, modelEngineData);
          console.log("Updated BarPlotBM!")
        });

        
    });
    

function updateBarPlotBM(selectedValue, databm) {
    // Löschen Sie vorherige Balken
    svgmodel.selectAll("*").remove();

//    var nestedData = d3.nest()
//    .key(function(d) { return d.model; })
//    .key(function(d) { return d.fuel; })
//    .rollup(function(leaves) { return leaves.length; })
//    .entries(databm.filter(function(d) { return d.make === selectedValue; }));

var stackData = databm.map(function(d) {
    var y0 = 0;
    var fuels = d.values.map(function(dd) {
        return { model: d.key, fuel: dd.key, count: dd.value, y0: y0, y1: y0 += dd.value };
    });
    return { model: d.key, fuels: fuels };
});

    
// X-Achse
var x = d3.scaleBand()
    .range([0, widthbm])
    .domain(stackData.map(function(p) { return p.model; }))
    .padding(0.1);
svgmodel.append("g")
    .attr("transform", "translate(0," + heightbm + ")")
    .call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

// Y-Achse
var y = d3.scaleLinear()
    .domain([0, d3.max(stackData, function(p) { 
        return d3.sum(p.fuels, function(dd) { return dd.count; }); 
    })])
    .range([heightbm, 0]);
svgmodel.append("g")
    .call(d3.axisLeft(y));

// Gruppen für jedes Modell
var modelGroups = svgmodel.selectAll(".model-group")
    .data(stackData)
    .enter().append("g")
    .attr("class", "model-group")
    .attr("transform", function(d) { return "translate(" + x(d.model) + ",0)"; });

// Erstellen der einzelnen Balken
modelGroups.selectAll("rect")
    .data(function(d) { return d.fuels; })
    .enter().append("rect")
    .attr("x", function(d, i, nodes) { 
        return i * (x.bandwidth() / nodes.length);
    })
    .attr("width", x.bandwidth() / stackData[0].fuels.length)
    .attr("y", function(d) { return y(d.count); })
    .attr("height", function(d) { return heightbm - y(d.count); })
    .attr("fill", function(d) { return colorScale(d.fuel); });
}




// console.log('hello world');

// A different attempt at adding both click counters and d3 connections

// Data 
var data = [
    {
        name: "beeker",
        value: 1},
    {
        name: "alice",
        value: 1
    }]


window.addEventListener("load", function() { // when the page has loaded
    
    document.getElementById("beeker-button").addEventListener("click", function() {
        message = (data[0].value == 1) ? "1 time you've said you love Beeker" : data[0].value + " times you've said you love Beeker";
        document.getElementById("beeker-counter").innerText = message;
        document.getElementById("beeker-score").innerText = data[0].value;
        data[0].value++;

    });
    document.getElementById("coltrane-button").addEventListener("click", function() {
        message = (data[1].value == 1) ? "1 time you've said you love Alice Coltrane" : data[1].value + " times you've said you love Alice Coltrane";
        document.getElementById("coltrane-counter").innerText = message;
        document.getElementById("alice-score").innerText = data[1].value;
        data[1].value++;
    });
  });

// set the dimensions and margins of the graph
var margin = {top: 30, right: 30, bottom: 70, left: 60},
    width = 460 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
// var obj2 = [{ name: "beeker",value: 1},{name: "alice",value: 1  }]
d3.json(data, function(data1) {

// X axis
var x = d3.scaleBand()
  .range([ 0, width ])
  .domain(data.map(function(d) { return d.name; }))
  .padding(0.2);
svg.append("g")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x))
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .style("text-anchor", "end");

// Add Y axis
var y = d3.scaleLinear()
  //.domain([0, 13])
  .domain([0, d3.max(data, function(d) { return d.value; })])
  .range([ height, 0]);
svg.append("g")
  .call(d3.axisLeft(y));

// Bars
var bars = svg.selectAll("mybar")
  .data(data)
  .enter()
  .append("rect")
    .attr("x", function(d) { return x(d.name); })
    .attr("y", function(d) { return y(d.value); })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(d.value); })
    .attr("fill", "#69b3a2")

})

// // A function that create / update the plot for a given variable:
// function update(data) {

//     var bars = svg.selectAll("mybar")
//       .data(data)
//       .enter()
//       .append("rect")
//       .transition()
//       .duration(1000)
//       .attr("x", function(d) { return x(d.name); })
//       .attr("y", function(d) { return y(d.value); })
//         .attr("width", x.bandwidth())
//         .attr("height", function(d) { return height - y(d.value); })
//         .attr("fill", "#69b3a2")
//   }


function render (data) {
  
    const update = svg.selectAll('rect')
    

    
    update.exit()
      .remove()
      svg.append("g")
  .call(d3.axisLeft(y));
   
    update
      .transition()
      svg.append("g")
      .call(d3.axisLeft(y));
   
    update
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.name); })
        .attr("y", function(d) { return y(d.value); })
        .attr("width", x.bandwidth())
        .attr("height", function(d) { return height - y(d.value); })
        .attr("fill", "#69b3a2")
  };

window.addEventListener("click", function() { // when the page has loaded
   // Initialize the plot with the first dataset
   render(data)
   });
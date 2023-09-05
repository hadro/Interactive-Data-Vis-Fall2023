// console.log('hello world');

// Data container for click increments
const dataset = [
    {
        name: "beeker",
        value: 1},
    {
        name: "alice",
        value: 1
    }]  

window.addEventListener("load", function() { // when the page has loaded
    
    document.getElementById("beeker-button").addEventListener("click", function() {
        message = (dataset[0].value == 1) ? "1 time you've said you love Beeker" : dataset[0].value + " times you've said you love Beeker";
        document.getElementById("beeker-counter").innerText = message;
        document.getElementById("beeker-score").innerText = dataset[0].value;
        dataset[0].value++;

    });
    document.getElementById("coltrane-button").addEventListener("click", function() {
        message = (dataset[1].value == 1) ? "1 time you've said you love Alice Coltrane" : dataset[1].value + " times you've said you love Alice Coltrane";
        document.getElementById("coltrane-counter").innerText = message;
        document.getElementById("alice-score").innerText = dataset[1].value;
        dataset[1].value++;
    });
  });

// window.addEventListener("click", function() { // when the page has loaded
//    // Initialize the plot with the first dataset
// //    render(data)
//    });

/*
D3 ZONE

I was able to successfully get a D3 object built in, and I was able to tie it to the data in the object.
It even has basic transitions!
However, I maxed out my understanding when trying to add axis labels, and getting the axis/domain to update 
as the values in the data object incremented. I'm sure it's possible though, maybe via joins?
Also, only the beeker button updates the actual d3 svg part of the DOM, however I'm sure that's something basic that
I'm just not seeing.

The code is largely adapted from here: https://observablehq.com/@uvizlab/d3-tutorial-4-bar-chart-with-transition?collection=@uvizlab/d3-tutorial

*/



const w = 600
const h = 250
   // xScale will help us set the x position of the bars
const xScale = d3.scaleBand() //Ordinal scale
           .domain(d3.range(dataset.length)) //sets the input domain for the scale
           .rangeRound([0, w]) //enables rounding of the range
           .paddingInner(0.05); //spacing between each bar
//yScale will help us map data to the height of bars in the barchart
const yScale = d3.scaleLinear()
    //.domain([0, d3.max(dataset, function(d) { return d.value; })]) //sets the upper end of the input domain to the largest data value in dataset
    .domain([0, d3.max(dataset, function(d) { return d.value; })+2]) //sets the upper end of the input domain to the largest data value in dataset
    .range([0, h]);
//Create SVG element
svg = d3.select("#my_dataviz")
				.append("svg")
				.attr("width", w)
				.attr("height", h);
//Create bars
svg.selectAll("rect")
  .data(dataset)
  .enter()
  .append("rect")
  .attr("x", function(d, i) { // position in x-axis
    return xScale(i); // we will pass the values from the dataset
  })
  .attr("y", function(d) {
    return h - yScale(d.value);
  })
  .attr("width", xScale.bandwidth()) //Asks for the bandwith of the scale
  .attr("height", function(d) {
    return yScale(d.value);
  })
  .attr("fill", function(d) {
    return "rgb("+ Math.round(d.value * 8) + ",0," + Math.round(d.value * 10) + ")"; //Change the color of the bar depending on the value
  });

d3.select(".increment")
    .on("click", function() {
        // newData(); //Changes de values of the data
        updateBar(); //Updates the bar chart
    });
  
function updateBar(){
    //Update all rects
    svg.selectAll("rect")
        .data(dataset)
        .transition() // <---- Here is the transition
        .duration(1000) // 1 second
        .attr("y", function(d) {
        return h - yScale(d.value);
        })
        .attr("height", function(d) {
        return yScale(d.value);
        })
        .attr("fill", function(d) {
        return "rgb("+ Math.round(d.value * 8) + ",0," + Math.round(d.value * 10) + ")";
        });
      }
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 100, right: 200 };



/* APPLICATION STATE */
let state = {
  data: [],
};

// // since we use our scales in multiple functions, they need global scope
let svg;
let xScale;
let yScale;
let colorScale;
let xAxis;
let yAxis;

/* LOAD DATA */
d3.csv('../data/MoMA_topTenNationalities.csv', d3.autoType).then(raw_data => {
  console.log("data", raw_data);
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  /* SCALES */
xScale = d3.scaleLinear()
  .domain([0, d3.max(state.data, d=> d.Count)])
  .range([margin.left,width]) // visual variable
  
yScale = d3.scaleBand()
  .domain(state.data.map(d=> d.Nationality))
  .range([height - margin.bottom, margin.top])
  .paddingInner(.2)
  
yAxis =  d3.axisLeft(yScale);
xAxis =  d3.axisBottom(xScale);
  
colorScale = d3.scaleOrdinal(d3.schemeCategory10);

svg = d3.select("#container")
  .append("svg")
  .attr("width", width - margin.left)
  .attr("height", height - margin.bottom)
  .attr("viewBox", [0, 0, width, height]);

svg.append("g")
.attr("transform", `translate(0, ${height-margin.bottom})`)
.call(xAxis)
.selectAll(".tick text")
.attr("font-size","1.5em");

svg.append("g")
.attr("transform", `translate(100, 0)`)
.call(yAxis)
.selectAll(".tick text")
.attr("font-size","1.5em");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {
  /* HTML ELEMENTS */

svg.selectAll("rect.bar")
  .data(state.data, d => d.Nationality)
  .join(
    enter => enter.append("rect")
        .attr("class", "bar")
        .attr("x", margin.left)
        .attr("y", d=> yScale(d.Nationality))
        .attr("height", d=> yScale.bandwidth(d))
        .attr("fill", function(d,i) {
          return colorScale(i);})
          .call(sel => sel
            .transition()
            .duration(1000)
            .attr("width", d=>  xScale(d.Count))
            .delay((d,i) => {return i*50})
        
            ),
    update => update,
    exit => exit
    
    
    )
  
    






}
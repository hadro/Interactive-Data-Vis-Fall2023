/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
height = window.innerHeight * 0.8,
margin = { top: 100, bottom: 100, left: 100, right: 100 }


/* LOAD DATA */
d3.csv('../data/cpiai_quarter.csv', d => {
// use custom initializer to reformat the data the way we want it
// ref: https://github.com/d3/d3-fetch#dsv
return {
  date: new Date(d.Date),
  index: +d.Index,
  inflation: +d.Inflation
}
}).then(data => {
console.log('data :>> ', data);

// + SCALES
const xScale = d3.scaleTime()
  .domain(d3.extent(data, d => d.date))
  .range([margin.right, width - margin.left])

const yScale = d3.scaleLinear()
  .domain(d3.extent(data, d => d.index))
  .range([height - margin.bottom, margin.top])

// CREATE SVG ELEMENT
const svg = d3.select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// BUILD AND CALL AXES
  svg.append('g')
  .attr("transform", `translate(0, ${height-margin.bottom})`)
  .call(d3.axisBottom(xScale))
  
  svg.append("text")
  .attr("transform", "rotate(-90)")
  .attr("x", 0-height/2)
  .attr("y",(35))
  .attr("dy", "1em")
  .style("text-anchor", "middle")
  .text("Consumer price index");

svg.append("text")      // text label for the x axis
  .attr("x", (width / 2)) 
  .attr("y", height-margin.bottom+50 )
  .style("text-anchor", "middle")
  .text("Date");

const yAxis = d3.axisLeft(yScale)
  // .tickFormat(formatBillions)

const yAxisGroup = svg.append("g")
  .attr("class", "yAxis")
  .attr("transform", `translate(${margin.right}, ${0})`)
  .call(yAxis)


// LINE GENERATOR FUNCTION
// const lineGen = d3.line()
//   .x(d => xScale(d.date))
//   .y(d => yScale(d.index))
const areaGen = d3.area()
  .x(d => xScale(d.date))
  .y0(yScale(10))
  .y1(d => yScale(d.index))

//  const groupedData = d3.groups(data, d => d.country)

// DRAW LINE
svg.selectAll(".line")
  .data(data) // 
  .join("path")
  .attr("class", 'line')
  // .attr("fill", "none")
  .attr("fill", "steelblue")
  .attr("stroke", "steelblue")
  .attr("stroke-width", 2.5)
  .attr("d", areaGen(data))


  
});
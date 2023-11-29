/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.85,
  margin = ({top: 10, right: 0, bottom: 30, left: 0})
  
  let state = {
    data: [],
    hover: {
      country: null,
      count: null
    },
    selectedGender: "All", // + YOUR INITIAL FILTER SELECTION
    selectedClassification: "All",
    selectedToggle: 1
  };

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colorScale;
let yAxis;
let yAxis2;
let tooltip;
let mouseHover;
let mouseleave;
let filteredData;
let delaySet;
let g1;
let g2;
let xAxis2;
let xAxis3;

Promise.all([
    d3.csv("shaped_with_classification.csv", d => {
        return {
            Year: +d.year, 
            Classification: d.classification,
            female: +d.female,
              male: +d.male
        }})
  ]).then(([data2]) => {
    state.data2 = data2;

    init();
  });

  function init() {

// + UI ELEMENT SETUP

const selectElementClassification = d3.select("#dropdown-classification")

  selectElementClassification
  .selectAll("option")
  .data([...Array.from(new Set(state.data2.map(d => d.Classification))), "All"])
  .join("option")
  .attr("value", d => d)
  .text(d => d)
  .attr("selected", "All")

  selectElementClassification
  .on("change", event => {
    // console.log(event.target.value);
    state.selectedClassification = event.target.value;
    draw();
  })
  
  y = d3.scaleBand()
  .domain(state.data2.map(d => d.Year))
  .rangeRound([height - margin.bottom, margin.top])
  .padding(0.1)

    yAxis2 = g => g
    .attr("transform", `translate(${ width/2 -28},0)`)
    .attr("class", "yAxis")
    .call(d3.axisRight(y)
    .tickValues(d3.range(1930, 2023, 10))
    )
    .call(g => g.selectAll(".tick line").attr("stroke", "none").attr("fill", "none"))
    .call(g => g.select(".domain").remove())
    
    svg = d3.select("#container")
    .append("svg")
    .attr("width", width - margin.left)
    .attr("height", height - margin.bottom)
    .attr("viewBox", [0, 0, width, height])
    .attr("font-family", "sans-serif")
    .attr("font-size", 12);

    svg.append("g")
    .style("font-size", "1.5em")
.call(yAxis2); 

    delaySet = 10;
  
    tooltip = d3.select("#container")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "5px")
    .style("padding", "10px")
    .style("position", "absolute")
  
options = function(d) { 
option1 = `<h3>${d.Year}</h3><b><span style="color:#fc8d62;">Male:</span> ${d.male}</b><br>
    <b> <span style="color:#66c2a5;">Female</span></b>: ${d.female}`;
option2 = `<h3>${d.Year}</h3><b><span style="color:#fc8d62;">Male</span></b>: ${d.male}<br>
    <b><span style="color:#66c2a5;">Female:</span> ${d.female}</b>`;
    return d.male > d.female ? option1 : option2;
  }

  mouseHover = function(event, d) {
    tooltip
    .style("opacity", 1)
    .html(options(d))
    .style("left", event.x + 70 + "px") 
    .style("top", event.y - 120 + "px")
    .transition()
    .delay(50)
  }

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
      mouseleave = function(event,d) {
        tooltip
          .transition()
          .delay(20)
          .duration(200)
          .style("opacity", 0)
      }

d3.selectAll("[name=greaterToggle]").on("change", function() {
  selectedToggle = this.value;
  opacity = this.checked ? d3.schemeSet2[0] : d3.schemeSet2[0];
  console.log(opacity, selectedToggle)
svg.selectAll("rect.year-female")
  .filter(function(d) {return d.female > d.male;})
  .transition()
  .style("fill", opacity);
  svg.selectAll("rect.year-female")
  .filter(function(d) {return d.male > d.female;})
  .transition()
  .style("fill", "#ccc");
  svg.selectAll("rect.year-male")
  .filter(function(d) {return d.female > d.male;})
  .transition()
  .style("fill", d3.schemeSet2[1]);
  svg.selectAll("rect.year-male")
  .filter(function(d) {return d.male > d.female;})
  .transition()
  .style("fill", "#ccc");
   draw()
  }); 


    draw();
  }
  function draw() {

//   // + FILTER DATA BASED ON STATE
filteredData = state.data2
//     // .filter(d => state.selectedGender === "All" || d.male >=0)
//     // .filter(d => state.selectedYear === "All" || state.selectedYear == d.Year)
    .filter(d => d.Classification === state.selectedClassification)

        xM = d3.scaleLinear()
        .domain([0, d3.max(filteredData, d => Math.max(d.female,d.male))])
        .rangeRound([(width / 2)-25, margin.left])
        .nice();
        
        xF = d3.scaleLinear()
          .domain(xM.domain())
          .rangeRound([(width / 2)+25, width - margin.right])
          .nice();
          
        g1 = svg.append("g").attr('class', 'x-axis-left');
        g2 = svg.append("g").attr('class', 'x-axis-right');
        xAxis2 = d3.axisBottom(xM);
        xAxis3 = d3.axisBottom(xF);
        
        svg.select('.x-axis-left')
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("font-size", "1.6em")
    .transition()
    .duration(1500)
    // .ease(d3.easeLinear)
        .call(xAxis2);

        svg.select('.x-axis-right')
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("font-size", "1.6em")
        // .attr("transform", `translate(${margin.left}, ${height / 2})`)
    .transition()
    .duration(1500)
    // .ease(d3.easeLinear)
        .call(xAxis3);


svg // male
.selectAll("rect.year-male")
.data(filteredData, d => d.male + d.Year + d.Classification + state.selectedToggle)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-male")
    .attr("id", d => d.male + d.Year + d.Classification + state.selectedToggle)
.attr("fill", d => d3.schemeSet2[1])
.attr("x", (width / 2)-25)
.attr("y", d => y(d.Year))
.attr("height", y.bandwidth())
.attr("width", 0)
.call(sel => sel
    .transition()
    .duration(1000)
  .delay((d,i) => {return i*delaySet})
  .attr("x", d => xM(d.male))
  .attr("width", d => xM(0) - xM(d.male))
  // .ease(d3.easeLinear)
   ),
    update => update
    .call(sel => sel
    .attr("x", d => xM(d.male))
    .attr("width", d => xM(0) - xM(d.male))),
    exit => exit
    .call(sel => sel
        .transition()
        .duration(1000)
      .delay(150)
      .attr("x", (width / 2)-25)
    .attr("width", 0)
        .remove())
)
.on("mouseleave", mouseleave )
.on("mouseover", mouseHover )

svg // female
.selectAll("rect.year-female")
.data(filteredData, d => d.female + d.Year + d.Classification + state.selectedToggle)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-female")
    .attr("id", d => d.female + d.Year + d.Classification + state.selectedToggle)
.attr("fill", d => d3.schemeSet2[0])
.attr("x", (width / 2)+25)
.attr("y", d => y(d.Year))
.attr("height", y.bandwidth())
.attr("width", 0)
.call(sel => sel
    .transition()
    .duration(1000)
    .delay((d,i) => {return i*delaySet})
  .attr("x", xF(0))
  .attr("width", d => xF(d.female) - xF(0))
  // .ease(d3.easeLinear)
   ),
    update => update
    .call(sel => sel
    .attr("x", d => xF(0))
    .attr("width", d => xF(d.female) - xF(0))),
    exit => exit
    .call(sel => sel
        .transition()
        .duration(1000)
      .delay(150)
      .attr("x", (width / 2)+25)
    .attr("width", 0)
        .remove())
)
.on("mouseleave", mouseleave )
.on("mouseover", mouseHover )

}


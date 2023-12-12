export function butterfly() {
  /* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.95,
  margin = ({top: 10, right: 0, bottom: 30, left: 0})
  
  let state = {
    data: [],
    hover: {
      country: null,
      count: null
    },
    selectedGender: "All", // + YOUR INITIAL FILTER SELECTION
    selectedClassification: "All",
    selectedToggle: false
  };

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
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
let toggle;
let y;
let xM;
let xF;
let GridL;
let GridR;
let color;

Promise.all([
    d3.csv("moma_data_shaped_with_classification.csv", d => {
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
  .data([...Array.from(new Set(state.data2.map(d => d.Classification)))])
  .join("option")
  .attr("value", d => d)
  .text(d => d)

  selectElementClassification
  .on("change", event => {
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


  mouseHover = function(event, d) {
    tooltip
    .style("opacity", 1)
    .html(`<h3>${d.Year}</h3><b><span style="color:#fc8d62;">Male:</span></b> ${d.male}<br>
    <b> <span style="color:#66c2a5;">Female</span></b>: ${d.female}`)
    .style("left", ((event.x > width/2 + 50) ? event.x + 70 + "px" :event.x + -140 + "px")) 
    .style("top", event.y + 20 + "px")
    .transition()
    svg.selectAll(`rect[year="${d.Year}"]`)
    .transition()
    .style("opacity", "0.5")
  }

      // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
      mouseleave = function(event,d) {
        tooltip
          .transition()
          .style("opacity", 0);
          svg.selectAll(`rect[year="${d.Year}"]`)
          .transition()
    .style("opacity", "1")
      }

d3.selectAll("[name=greaterToggle]").on("change", function() {
  state.selectedToggle = this.checked;
  color = this.checked ? d3.schemeSet2[0] : d3.schemeSet2[0];
 toggle(state.selectedToggle)
  }); 

toggle = function(toggleState) {
  return state.selectedToggle === true ?
  (svg.selectAll("rect.year-female")
  .filter(function(d) {return d.female > d.male;})
  .transition()
  .style("fill", d3.schemeSet2[0]),
  svg.selectAll("rect.year-female")
  .filter(function(d) {return d.male > d.female;})
  .transition()
  .style("fill", "#aaa"),
  svg.selectAll("rect.year-male")
  .filter(function(d) {return d.female > d.male;})
  .transition()
  .style("fill", d3.schemeSet2[1]),
  svg.selectAll("rect.year-male")
  .filter(function(d) {return d.male > d.female;})
  .transition()
  .style("fill", "#aaa"))  : (svg.selectAll("rect.year-female")
  .transition()
  .style("fill", d3.schemeSet2[0]),
  svg.selectAll("rect.year-male")
  .transition()
  .style("fill", d3.schemeSet2[1]))

}


    draw();
  }
  function draw() {

//   // + FILTER DATA BASED ON STATE
filteredData = state.data2
//     // .filter(d => state.selectedGender === "All" || d.male >=0)
//     // .filter(d => state.selectedYear === "All" || state.selectedYear == d.Year)
    .filter(d => d.Classification === state.selectedClassification)
    // .filter( state.selectedToggle === true ? )

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
        xAxis2 = d3.axisBottom(xM).ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 1 : 8)
        .tickFormat(function(e){if(Math.floor(e) != e) {return;} return e;});
        xAxis3 = d3.axisBottom(xF).ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 1 : 8)
        .tickFormat(function(e){if(Math.floor(e) != e) {return;} return e;});
        
        svg.select('.x-axis-left')
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("font-size", "1.6em")
        .transition()
        .duration(1500)
        .call(xAxis2);

        svg.select('.x-axis-right')
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("font-size", "1.6em")
        .transition()
        .duration(1500)
        .call(xAxis3);

    // set horizontal grid line
const gridLeft = svg.append("g").attr("class", "grid-left");
const gridRight = svg.append("g").attr("class", "grid-right")
GridL = () => d3.axisBottom().scale(xM);
GridR = () => d3.axisBottom().scale(xF);

svg.select('.grid-left')
  .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("stroke", "#333")
    .style("stroke-width", "0.3px")
    .style("stroke-opacity", "0.3")
    .transition()
    .duration(1500)
  .call(GridL()
    .tickSize(-height, 0, 0)
    .tickFormat("")
    .ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 0 : 8)
);
svg.select('.grid-right')
  .attr("transform", `translate(0,${height - margin.bottom})`)
    .style("stroke", "#333")
    .style("stroke-width", "0.3px")
    .style("stroke-opacity", "0.3")
    .transition()
    .duration(1500)
  .call(GridR()
    .tickSize(-width, 0, 0)
    .tickFormat("")
    .ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 0 : 8)
);

svg // male
.selectAll("rect.year-male")
.data(filteredData, d => d.Year + d.Classification + d.male +  state.selectedToggle)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-male")
    .attr("id", d => d.Year + d.Classification + d.male + state.selectedToggle)
    .attr("year", d => d.Year)
.attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : "#aaa")
.attr("x", (width / 2)-25)
.attr("y", d => y(d.Year))
.attr("height", y.bandwidth())
.attr("width", 0)
.call(sel => sel
    .transition()
    .duration(1000)
  .delay((d,i) => {return i*delaySet})
  .attr("x", d => xM(d.male))
  .attr("width", d => xM(0) - xM(d.male))),
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
.data(filteredData, d => d.Year + d.Classification + d.female +  state.selectedToggle)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-female")
    .attr("id", d => d.Year + d.Classification + d.female + state.selectedToggle)
    .attr("year", d => d.Year)
.attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
                    d.female > d.male ? d3.schemeSet2[0] : "#aaa"
)
.attr("x", (width / 2)+25)
.attr("y", d => y(d.Year))
.attr("height", y.bandwidth())
.attr("width", 0)
.call(sel => sel
    .transition()
    .duration(1000)
    .delay((d,i) => {return i*delaySet})
  .attr("x", xF(0))
  .attr("width", d => xF(d.female) - xF(0))),
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

}
butterfly()
/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.9,
  margin = ({top: 10, right: 0, bottom: 20, left: 0})
  
  let state = {
    data: [],
    hover: {
      country: null,
      count: null
    },
    selectedGender: "All", // + YOUR INITIAL FILTER SELECTION
    selectedYear: "All"
  };

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let colorScale;
let lifespan;
let xAxis;
let yAxis;
let tooltip;
let mouseHover;
let mouseleave;
let filteredData;
let delaySet;

Promise.all([
    d3.csv("met_data.csv", d => {
        // use custom initializer to reformat the data the way we want it
        // ref: https://github.com/d3/d3-fetch#dsv
        return {
          Year: +d.DateAcquired_yr,
          Count: +d.Count,
          Gender: d.Gender
        }}), 
        d3.csv("met_data_shaped.csv", d => {
            // use custom initializer to reformat the data the way we want it
            // ref: https://github.com/d3/d3-fetch#dsv
            return {
              Year: +d.DateAcquired_yr,
              female: +d.female,
              male: +d.male
            }})
  ]).then(([data, data1]) => {
    state.data = data;
    state.data1 = data1;
    // console.log(data1)
    init();
  });

  function init() {
  xM = d3.scaleLinear()
  .domain([0, d3.max(state.data, d => d.Count)])
  .rangeRound([width / 2, margin.left])
  
  xF = d3.scaleLinear()
    .domain(xM.domain())
    .rangeRound([width / 2, width - margin.right])

  y = d3.scaleBand()
    .domain(state.data.map(d => d.Year))
    .rangeRound([height - margin.bottom, margin.top])
    .padding(0.1)

// console.log(state.data[0].Count)
// console.log(xF(state.data[0].Count))


// + UI ELEMENT SETUP
  
const selectElementYear = d3.select("#dropdown-year")
const selectElementGender = d3.select("#dropdown-gender")

selectElementGender
  .selectAll("option")
  .data([...Array.from(new Set(state.data.map(d => d.Gender))), "All"])
  .join("option")
  .attr("value", d => d)
  .text(d => d)
  .attr("selected", "All")


  selectElementYear
  .selectAll("option")
  .data([...Array.from(new Set(state.data.map(d => d.Year))), "All"])
  .join("option")
  .attr("value", d => d)
  .text(d => d)
  .attr("selected", "All")

  selectElementGender
  .on("change", event => {
    // console.log(event.target.value);
    state.selectedGender = event.target.value;
    draw();
  })

  selectElementYear
  .on("change", event => {
    // console.log(event.target.value);
    state.selectedYear = event.target.value;
    draw();
  })

  xAxis = g => g
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(g => g.append("g").call(d3.axisBottom(xM).ticks(width / 80, "s")))
    .call(g => g.append("g").call(d3.axisBottom(xF).ticks(width / 80, "s")))
    .call(g => g.selectAll(".domain").remove())
    .call(g => g.selectAll(".tick:first-of-type").remove())

  yAxis = g => g
    .attr("transform", `translate(${xM(0)},0)`)
    .call(d3.axisRight(y).tickSizeOuter(0))
    .call(g => g.selectAll(".tick text").attr("fill", "green"))


    svg = d3.select("#container")
    .append("svg")
    .attr("width", width - margin.left)
    .attr("height", height - margin.bottom)
    .attr("viewBox", [0, 0, width, height])
    .attr("font-family", "sans-serif")
    .attr("font-size", 10);


    delaySet = 150;

    draw();
  }
  function draw() {

  // + FILTER DATA BASED ON STATE
const filteredData = state.data1
    .filter(d => state.selectedGender === "All" || state.selectedGender === d.Gender)
    .filter(d => state.selectedYear === "All" || state.selectedYear == d.Year)

    // console.log(filteredData, state.selectedYear)

    state.data1.forEach((x, i) => console.log(x, i));
    state.data1.forEach((x, i) => x)
svg // male
.selectAll("rect.year-male")
.data(filteredData, d => d.male + d.Year)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-male")
    .attr("id", d => d.male + d.Year)
.attr("fill", d => d3.schemeSet2[1])
.attr("x", width/2)
.attr("y", d => y(d.Year))
.attr("height", y.bandwidth())
.attr("width", 0)
.call(sel => sel
    .transition()
    .duration(1000)
  .delay((d,i) => {return i*delaySet})
  .attr("x", d => xM(d.male))
  .attr("width", d => xM(0) - xM(d.male))
  .ease(d3.easeLinear)
   ),
    update => update
    .call(sel => sel
    //     .transition()
    //     .duration(1000)
    //   .delay(150)
    .attr("x", d => xM(d.male))
    .attr("width", d => xM(0) - xM(d.male))),
    exit => exit
    .call(sel => sel
        .transition()
        .duration(1000)
      .delay(150)
      .attr("x", width/2)
    .attr("width", 0)
        .remove())
)
svg // female
.selectAll("rect.year-female")
.data(filteredData, d => d.female + d.Year)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-female")
    .attr("id", d => d.female + d.Year)
.attr("fill", d => d3.schemeSet2[0])
.attr("x", width/2)
.attr("y", d => y(d.Year))
.attr("height", y.bandwidth())
.attr("width", 0)
.call(sel => sel
    .transition()
    .duration(1000)
    .delay((d,i) => {return i*delaySet})
  .attr("x", xF(0))
  .attr("width", d => xF(d.female) - xF(0))
  .ease(d3.easeLinear)
   ),
    update => update
    .call(sel => sel
    //     .transition()
    //     .duration(1000)
    //   .delay(150)
    .attr("x", d => xF(0))
    .attr("width", d => xF(d.female) - xF(0))),
    exit => exit
    .call(sel => sel
        .transition()
        .duration(1000)
      .delay(150)
      .attr("x", width/2)
    .attr("width", 0)
        .remove())
)

svg.append("g") // male
.attr("fill", "blue")
.selectAll("text")
.data(filteredData)
.join("text")
.attr("text-anchor", "start")
.attr("x", d => xM(d.male) - 100)
.attr("y", d => y(d.Year) + y.bandwidth() / 2)
.attr("dy", "0.35em")
.text(d => d.male.toLocaleString());
svg.append("g") // female
.attr("fill", "blue")
.selectAll("text")
.data(filteredData)
.join("text")
.attr("text-anchor", "end")
.attr("x", d => xF(d.female) + 100)
.attr("y", d => y(d.Year) + y.bandwidth() / 2)
.attr("dy", "0.35em")
.text(d => d.female.toLocaleString());


// svg.append("text")
// .attr("text-anchor", "end")
// .attr("fill", "white")
// .attr("dy", "0.35em")
// .attr("x", xM(0) - 4)
// .attr("y", y(filteredData[0].Count) + y.bandwidth() / 2)
// .text("Male");

// svg.append("text")
// .attr("text-anchor", "start")
// .attr("fill", "white")
// .attr("dy", "0.35em")
// .attr("x", xF(0) + 24)
// .attr("y", y(filteredData[0].Count) + y.bandwidth() / 2)
// .text("Female");

svg.append("g")
.call(xAxis);

svg.append("g")
.call(yAxis); 


}


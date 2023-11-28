/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.9,
  margin = ({top: 10, right: 0, bottom: 30, left: 0})
  
  let state = {
    data: [],
    hover: {
      country: null,
      count: null
    },
    selectedGender: "All", // + YOUR INITIAL FILTER SELECTION
    selectedClassification: "All"
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
    d3.csv("met_data.csv", d => {
        // use custom initializer to reformat the data the way we want it
        // ref: https://github.com/d3/d3-fetch#dsv
        return {
          Year: +d.DateAcquired_yr,
          Count: +d.Count,
          Gender: d.Gender
        }}), 
        d3.csv("unique_artists_moma_data_shaped.csv", d => {
            // use custom initializer to reformat the data the way we want it
            // ref: https://github.com/d3/d3-fetch#dsv
            return {
              Year: +d.DateAcquired_yr,
              female: +d.female,
              male: +d.male
            }}),
    d3.csv("shaped_with_classification.csv", d => {
        return {
            Year: +d.year, 
            Classification: d.classification,
            female: +d.female,
              male: +d.male
        }})
  ]).then(([data, data1, data2]) => {
    state.data = data;
    state.data1 = data1;
    state.data2 = data2;
    //  console.log(data2)
    init();
  });

  function init() {


  // + FILTER DATA BASED ON STATE
filteredData = state.data2
// .filter(d => state.selectedGender === "All" || d.male >=0)
// .filter(d => state.selectedYear === "All" || state.selectedYear == d.Year)
// .filter(d => d.Classification === "all")


  y = d3.scaleBand()
    .domain(state.data2.map(d => d.Year))
    .rangeRound([height - margin.bottom, margin.top])
    .padding(0.1)

// + UI ELEMENT SETUP
  
const selectElementClassification = d3.select("#dropdown-classification")
const selectElementGender = d3.select("#dropdown-gender")

selectElementGender
  .selectAll("option")
  .data([...Array.from(new Set(state.data.map(d => d.Gender))), "All"])
  .join("option")
  .attr("value", d => d)
  .text(d => d)
  .attr("selected", "All")


  selectElementClassification
  .selectAll("option")
  .data([...Array.from(new Set(state.data2.map(d => d.Classification))), "All"])
  .join("option")
  .attr("value", d => d)
  .text(d => d)
  .attr("selected", "All")

  selectElementGender
  .on("change", event => {
    //  console.log(event.target.value);
    state.selectedGender = event.target.value;
    // console.log(event.target.value, state.selectedGender);
    draw();
  })

  selectElementClassification
  .on("change", event => {
    // console.log(event.target.value);
    state.selectedClassification = event.target.value;
    draw();
  })

//   xAxis = g => g
//     .attr("transform", `translate(0,${height - margin.bottom})`)
//     .attr("class", "xAxis")
//     .call(g => g.append("g").call(d3.axisBottom(xM).ticks(width / 80, "s")))
//     .call(g => g.append("g").call(d3.axisBottom(xF).ticks(width / 80, "s")))
//     .call(g => g.selectAll(".domain").remove())
//     .call(g => g.selectAll(".tick:first-of-type").remove())

  // yAxis = g => g
  //   .attr("transform", `translate(${xM(0)+15},0)`)
  //   //.call(d3.axisRight(y).tickSizeOuter(0))
  //   .call(d3.axisRight(y).tickValues([]))
  //   // .call(g => g.selectAll(".tick text").attr("fill", "green"))

    yAxis2 = g => g
    .attr("transform", `translate(${ width/2 -28},0)`)
    .attr("class", "yAxis")
    .call(d3.axisRight(y)
    // .tickSizeOuter(0)
    // .tickValues([1, 2, 3, 5, 8, 13, 21])
    .tickValues(d3.range(1930, 2023, 10))
    )
    // // .call(d3.axisRight(y).tickValues([]))
    // .call(g => g.selectAll(".tick text").attr("fill", "magenta"))
    // // .call(d3.axisRight(y)).selectAll(".tick line").remove()
    .call(g => g.selectAll(".tick line").attr("stroke", "none").attr("fill", "none"))
    .call(g => g.select(".domain").remove())
    // .call(d3.axisRight(y).tickValues([1, 2, 3, 5, 8, 13, 21]))

    // yAxis2 = g => g
    // .call(g => g.selectAll(".tick text")
    // .filter(d => d.Year % 10 === 0).attr("fill", "black"))

// state.data.forEach(d => d.Year % 10 === 0 ? console.log(d.Year) : console.log('No'))
// state.data.forEach(d => console.log(d.Year % 10 === 0))

    svg = d3.select("#container")
    .append("svg")
    .attr("width", width - margin.left)
    .attr("height", height - margin.bottom)
    .attr("viewBox", [0, 0, width, height])
    .attr("font-family", "sans-serif")
    .attr("font-size", 12);


    // svg.append("g")
    // .call(xAxis);

    svg.append("g")
    .style("font-size", "1.5em")
.call(yAxis2); 

    delaySet = 10;
  

    draw();
  }
  function draw() {

//   // + FILTER DATA BASED ON STATE
filteredData = state.data2
//     // .filter(d => state.selectedGender === "All" || d.male >=0)
//     // .filter(d => state.selectedYear === "All" || state.selectedYear == d.Year)
    .filter(d => d.Classification === state.selectedClassification)

    // console.log(filteredData, state.selectedClassification)


//   xM
//   .domain([0, d3.max(filteredData, d => Math.max(d.female,d.male))])
//   .rangeRound([(width / 2)-15, margin.left]);
  
//   xF
//     .domain(xM.domain())
//     .rangeRound([(width / 2)+15, width - margin.right]);
    
    // console.log(xM.domain(), xF.domain())

        // console.log(d3.max(filteredData, d => Math.max(d.female,d.male)))
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
        
        svg.selectAll('.x-axis-left')
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("font-size", "1.6em")
        // .attr("transform", `translate(${margin.left}, ${height / 2})`)
    .transition()
    .duration(1500)
    .ease(d3.easeLinear)
        .call(xAxis2);

        svg.selectAll('.x-axis-right')
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .style("font-size", "1.6em")
        // .attr("transform", `translate(${margin.left}, ${height / 2})`)
    .transition().duration(1500)
        .call(xAxis3);

        // console.log(svg.selectAll('g'))

    // state.data1.forEach((x, i) => console.log(x, i));
    filteredData.forEach((x, i) => x)
svg // male
.selectAll("rect.year-male")
.data(filteredData, d => d.male + d.Year + d.Classification)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-male")
    .attr("id", d => d.male + d.Year + d.Classification)
.attr("fill", d => d3.schemeSet2[1])
.attr("x", (width / 2)-15)
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
      .attr("x", (width / 2)-15)
    .attr("width", 0)
        .remove())
)
svg // female
.selectAll("rect.year-female")
.data(filteredData, d => d.female + d.Year + d.Classification)
.join(
    enter => enter
    .append("rect")
    .attr("class", "year-female")
    .attr("id", d => d.female + d.Year + d.Classification)
.attr("fill", d => d3.schemeSet2[0])
.attr("x", (width / 2)+15)
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
      .attr("x", (width / 2)+15)
    .attr("width", 0)
        .remove())
)

// svg.append("g") // male
// .attr("fill", "blue")
// .selectAll("text")
// .data(filteredData)
// .join("text")
// .attr("text-anchor", "start")
// .attr("x", d => xM(d.male) - 100)
// .attr("y", d => y(d.Year) + y.bandwidth() / 2)
// .attr("dy", "0.35em")
// .text(d => d.male.toLocaleString());
// svg.append("g") // female
// .attr("fill", "blue")
// .selectAll("text")
// .data(filteredData)
// .join("text")
// .attr("text-anchor", "end")
// .attr("x", d => xF(d.female) + 100)
// .attr("y", d => y(d.Year) + y.bandwidth() / 2)
// .attr("dy", "0.35em")
// .text(d => d.female.toLocaleString());


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


// svg.append("g")
// .call(yAxis); 



// svg.select("g .xAxis")
// .transition()
// .duration(49)
// // .call(d3.axisBottom(xScale).tickFormat(d3.format(".0%")))
// .call(d3.axisBottom(xM).scale(xM))
// .call(d3.axisBottom(xF).scale(xF))

    // // Update X axis
    // xM.domain([0, d3.max(filteredData, d => d.male)]);
    // xF.domain([0, d3.max(filteredData, d => d.male)]);
    // svg.select('.xAxis')
    // .transition().duration(150).ease(d3.easeLinear)
    // .call(d3.axisBottom(xM))
    // // .call(d3.axisBottom(xM).ticks(width / 80, "s"))
    // // .call(d3.axisBottom(xF).ticks(width / 80, "s"))

//     // Update chart
//     svg.selectAll("circle")
//        .data(data)
//        .transition()
//        .duration(1000)
//        .attr("cx", function (d) { return x(d.Sepal_Length); } )
//        .attr("cy", function (d) { return y(d.Petal_Length); } )

  // Add an event listener to the button created in the html part
//   d3.select("#buttonXlim").on("input", updatePlot )

  //Update xAxis scale




  //Call axes
//   xAxis = g => g
//   .attr("transform", "translate(0," + (height - margin.bottom) + ")")


    // .transition().duration(1000)
    // .call(xAxis);



}

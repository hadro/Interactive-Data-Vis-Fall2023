// Set up some basics!
const width = window.innerWidth * 0.75,
  height = window.innerHeight * 0.9,
  margin = ({top: 10, right: 10, bottom: 10, left: 70})

let state = {
    selectedClassification: "All",
    selectedChart: "Ratio",
    selectedToggle: false
  }

let svg;
let filteredData;
let x;
let y;
let GridLine;
let gridTop;
let gridBottom;
let GridT;
let GridB;
let colorScale;
let works;
let tooltip;
let mouseHover;
let mouseleave;
let fdot;
let mdot;
let g;
let g1;
let g2;
let yAxis;
let yAxis2;
let yAxis3;
let xAxis2;
let toggle;


// Functions for the radio buttons
const selectElementBars = d3.select("#bars")
const selectElementCircles = d3.select("#circles")

selectElementBars
.on("click", event => {
    bars()
})

selectElementCircles
.on("click", event => {
    circles()
})

const delaySet = 5;

// Load some data
Promise.all([
    d3.csv("moma_data_shaped_with_classification.csv", d => {
        return {
            Year: +d.year, 
            Classification: d.classification,
            female: +d.female + +d['non-binary'],
              male: +d.male,
              f_ratio: (+d.female + +d['non-binary']) / (+d.female + +d.male + +d['non-binary']),
              m_ratio: +d.male / (+d.female + +d.male + +d['non-binary']),
        }})
  ]).then(([data]) => {
    state.data = data;

    init();
  });

  function init() {

    // + UI ELEMENT SETUP
    x = d3.scaleTime()
    .domain(d3.extent(state.data, d => d.Year))
    .rangeRound([margin.left, width - margin.right])

    y = d3.scaleLinear()
    .domain([0, d3.max(state.data, d => Math.max(d.f_ratio,d.m_ratio))])
    .rangeRound([height-margin.bottom, margin.top])
    .nice();

    const xAxis1 =  d3.axisTop(x).tickFormat(d3.format("Y"))
    const xAxis2 =  d3.axisBottom(x).tickFormat(d3.format("Y"))
    const yAxis =  d3.axisLeft(y).tickFormat(d3.format(".0%"))

    // Classification selections
    const selectElementClassification = d3.select("#dropdown-classification")

  selectElementClassification
  .selectAll("option")
  .data([...Array.from(new Set(state.data.map(d => d.Classification)))])
  .join("option")
  .attr("value", d => d)
  .text(d => d)

  selectElementClassification
  .on("change", event => {
    
    state.selectedClassification = event.target.value;
    state.selectedChart === "Ratio" ? circles() : bars();
    
  })

  // Container and axes
    svg = d3.select("#container")
    .append("svg")
    .attr("width", width - margin.left-margin.right)
    .attr("height", height - margin.bottom-margin.top)
    .attr("viewBox", [-30, 0, width+50, height+10])
    .style("font-weight", "bold")

    svg.append("g")
    .attr("transform", `translate(0,${10})`)
    .style("font-size", "1.6em")
    .call(xAxis1.tickSizeOuter(0));
    svg.append("g")
    .attr("transform", `translate(0,${height-10})`)
    .style("font-size", "1.6em")
    .call(xAxis2.tickSizeOuter(0));
    svg.append("g")
    .attr("transform", `translate(${margin.left},${0})`)
    .style("font-size", "1.6em")
    .attr("id", "init-y-axis")
    .call(yAxis);

    
    colorScale = d3.scaleOrdinal(d3.schemeSet2);
    
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

    // Toggle
    d3.selectAll("[name=greaterToggle]").on("change", function() {
        state.selectedToggle = this.checked;
       toggle(state.selectedToggle)
        }); 
      
        toggle = function(toggleState) {
            return state.selectedToggle === true ?
            (svg.selectAll("rect.female-ratio")
            .filter(function(d) {return d.female > d.male;})
            .transition()
            .style("fill", d3.schemeSet2[0]),
            svg.selectAll("rect.female-ratio")
            .filter(function(d) {return d.male > d.female;})
            .transition()
            .style("fill", "#aaa"),
            svg.selectAll("rect.male-ratio")
            .filter(function(d) {return d.female > d.male;})
            .transition()
            .style("fill", d3.schemeSet2[1]),
            svg.selectAll("rect.male-ratio")
            .filter(function(d) {return d.male > d.female;})
            .transition()
            .style("fill", "#aaa"))  : 
            (svg.selectAll("rect.female-ratio")
            .transition()
            .style("fill", d3.schemeSet2[0]),
            svg.selectAll("rect.male-ratio")
            .transition()
            .style("fill", d3.schemeSet2[1]))
          }

        draw();
      }

      function draw() {


  // Add the parity line and axis label
  svg
    .append('path')
    .attr('id','parity-line')
    .attr("class", "parity")
    .attr('d', d3.line()([[margin.left,height/2 + margin.top /2-4], [width+margin.right, height/2 + margin.top /2 -4]]))
    .attr('stroke', 'black')
    // .attr('marker-end', 'url(#arrow)')
    .attr('fill', 'none');

    svg.append("text")
    .attr("id", "parity-text")
    .attr("class", "parity")
	.text("Parity of collected genders")
    // .style("font", "white")
	.attr("x", width/2 - 85)
	.attr("y", height/2 + margin.top /2 -12);

    svg.append("text") // Y axis label
    .attr("id", "y-axis-label")
    .attr("transform", "rotate(-90)")
    .attr("y", -20)
    .attr("x",0-height/2)
    .attr("dy", "2em")
    .style("text-anchor", "middle")
    .style("font-size", "1.2em")
    .attr("y", -50)
    .text("Percent of artists collected each year");

// set horizontal grid line
GridLine = () => d3.axisLeft().scale(y);
svg
  .append("g")
  .attr("transform", `translate(${margin.left},${0})`)
    .attr("class", "grid, parity")
    .style("stroke", "#333")
    .style("stroke-width", "0.3px")
    .style("stroke-opacity", "0.3")
  .call(GridLine()
    .tickSize(-width+margin.left, 0, 0)
    .tickFormat("")
    .ticks(8)
);

    // Add the data elements 
    filteredData = state.data
    .filter(d => d.Classification === state.selectedClassification)


    works = d3.scaleSqrt()
      .domain([0, d3.max(filteredData, d => Math.max(d.female,d.male))])
       .range([3,50]);


       mouseHover = function(event, d) {
        tooltip
        .style("opacity", 1)
        .html(`<h3>${d.Year}</h3><b><span style="color:#fc8d62;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Male</span></b>: ${d.male} (${d3.format(".0%")(d.m_ratio)})<br>
        <b> <span style="color:#66c2a5;">Female</span></b>: ${d.female} (${d3.format(".0%")(d.f_ratio)})`)
        // .style("left", ((event.x > width/2 + 50) ? event.x + 70 + "px" :event.x + -140 + "px")) 
        .style("left", event.x + 50 + "px")
        .style("top", event.y + 20 + "px")
        .transition()
        svg.selectAll(`rect[year="${d.Year}"]`)
        .transition()
        .attr("fill-opacity", "1")
        .attr("fill", d=>  "#aaa" );
      }
    
    
          // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
          mouseleave = function(event,d) {
            tooltip
              .transition()
              .style("opacity", 0);
              svg.selectAll("rect.male-ratio")
              .transition()
              .delay(20)
              .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
                d.female > d.male ? d3.schemeSet2[1] : "#aaa")
              .attr('fill-opacity', "0.5");
              svg.selectAll("rect.female-ratio")
              .transition()
              .delay(20)
              .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
                d.female > d.male ? d3.schemeSet2[0] : "#aaa")
              .attr('fill-opacity', "0.5");
          }
    
       
    fdot = svg //female
    .selectAll("rect.female-ratio")
    .data(filteredData, d => d.Year + d.female + d.f_ratio + d.Classification + state.selectedToggle)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("rect")
      .attr("class", "female-ratio")
      .attr("id", d => `${d.Year}-${d.female}-${d.f_ratio}-${d.Classification}`)
      .attr("year", d => d.Year)
      .attr("x", d=>  x(d.Year) - works(d.female))
      .attr("y", d=> y(d.f_ratio) - works(d.female))
      .attr("rx", 0)
      .attr("ry", 0)
    .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
    d.female > d.male ? d3.schemeSet2[0] : "#aaa")
      .attr('fill-opacity', "0.5")
      .call(sel => sel
        .transition()
        .duration(1500)
        .attr("rx", d=> works(d.female)* 2)
        .attr("ry", d=> works(d.female)* 2)
        .attr("height", d=> works(d.female)*2)
        .attr("width", d=> works(d.female)*2)
               ),
      update => update,
      exit => exit,
    )
    .on("mouseleave", mouseleave )
    .on("mouseover", mouseHover )
   
   
    mdot = svg //male
    .selectAll("rect.male-ratio")
    .data(filteredData, d => d.Year + d.male + d.m_ratio + d.Classification + state.selectedToggle)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("rect")
      .attr("class", "male-ratio")
      .attr("id", d => `${d.Year}-${d.female}-${d.f_ratio}-${d.Classification}`)
      .attr("year", d => d.Year)
      .attr("x", d=>  x(d.Year) - works(d.male))
      .attr("y", d=> y(d.m_ratio) - works(d.male))
      .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
        d.female > d.male ? d3.schemeSet2[1] : "#aaa")
      .attr('fill-opacity', "0.5")
      .call(sel => sel
        .transition()
        .duration(2500)
        // .delay(1500)
        .attr("rx", d=> works(d.male)*2)
        .attr("ry", d=> works(d.male)*2)
        .attr("height", d=> works(d.male)*2)
        .attr("width", d=> works(d.male)*2)
               ),
      update => update,
      exit => exit,
    )
    .on("mouseleave", mouseleave )
    .on("mouseover", mouseHover )
}


function circles() { //Function that redraws the ratio circles

    filteredData = state.data
    .filter(d => d.Classification === state.selectedClassification)

    state.selectedChart = "Ratio";

    d3.select('.y-axis-top')
    .remove();
    d3.select('.y-axis-bottom')
    .remove();
    d3.selectAll('.bar-grid')
    .remove();
    d3.select("#y-axis-label")
    .remove();

    // Swap out the explanatory test to make it relevant to the chart on display
    d3.select('#intro-swap')
    .transition()
    .duration(500)
    .style("opacity","0")
    .transition()
    .duration(500)
    .text("This chart shows the percentage of unique artists collected by the Museum of Modern Art (MoMA) for each year since 1929, broken out by the genders identified in the MoMA data. The size of the bubble represents how many artists of a given gender were collected that year.")
    .style("opacity","1");

    svg.append('path')
    .attr('id','parity-line')
    .attr("class", "parity")
    .attr('d', d3.line()([[margin.left,height/2 + margin.top /2-4], [width+margin.right, height/2 + margin.top /2 -4]]))
    .attr('stroke', 'black')
    // .attr('marker-end', 'url(#arrow)')
    .attr('fill', 'none');

    svg.append("text")
    .attr("id", "parity-text")
    .attr("class", "parity")
	.text("Parity of collected genders")
    // .style("font", "white")
	.attr("x", width/2 - 85)
	.attr("y", height/2 + margin.top /2 -12);


// set horizontal grid line
GridLine = () => d3.axisLeft().scale(y);
svg
  .append("g")
  .attr("transform", `translate(${margin.left},${0})`)
    .attr("class", "grid, parity")
    .style("stroke", "#333")
    .style("stroke-width", "0.3px")
    .style("stroke-opacity", "0.3")
  .call(GridLine()
    .tickSize(-width+margin.left, 0, 0)
    .tickFormat("")
    .ticks(8));

    yAxis =  d3.axisLeft(y).tickFormat(d3.format(".0%"))
    g = svg.append("g").attr("id", "init-y-axis");

    svg.select('#init-y-axis')
    .attr("transform", `translate(${margin.left},${0})`)
      .style("font-size", "1.6em")
      .transition()
      .duration(1000)
      .call(yAxis);

      svg.append("text") // Y axis label
      .attr("id", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x",0-height/2)
      .attr("dy", "2em")
      .style("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("opacity", "0")
      .transition()
      .duration(1200)
      .style("opacity", "1")
      .text("Percent of artists collected each year");


      mouseHover = function(event, d) {
        tooltip
        .style('opacity', "1")
        .html(`<h3>${d.Year}</h3><b><span style="color:#fc8d62;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Male</span></b>: ${d.male} (${d3.format(".0%")(d.m_ratio)})<br>
        <b> <span style="color:#66c2a5;">Female</span></b>: ${d.female} (${d3.format(".0%")(d.f_ratio)})`)
        .style("left", event.x+30+"px")
        .style("top", event.y+30+"px")
        // .style("left", ((event.x > width/2 + 50) ? event.x + 70 + "px" :event.x + -140 + "px")) 
        // .style("top", event.y + 20 + "px")
        .transition()
        svg.selectAll(`rect[year="${d.Year}"]`)
        .transition()
        .attr("fill-opacity", "1")
        .attr("fill", d=>  "#aaa" );
      }

          // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
          mouseleave = function(event,d) {
            tooltip
              .transition()
              .style("opacity", 0);
              svg.selectAll("rect.male-ratio")
              .transition()
              .delay(20)
              .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
              d.female > d.male ? d3.schemeSet2[1] : "#aaa")
              .attr('fill-opacity', "0.5");
              svg.selectAll("rect.female-ratio")
              .transition()
              .delay(20)
              .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
              d.female > d.male ? d3.schemeSet2[0] : "#aaa")
              .attr('fill-opacity', "0.5");
          }

    // Draw the data elements
    fdot = svg //female
    .selectAll("rect.female-ratio")
    .data(filteredData, d => d.Year + d.female + d.f_ratio + d.Classification + state.selectedToggle)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("rect")
      .attr("class", "female-ratio")
      .attr("year", d => d.Year)
      .attr("x", d=>  x(d.Year))
      .attr("y", d=> y(d.f_ratio))
      .call(sel => sel
        .transition()
        .duration(1000)
      // .delay(1500)
      .attr("x", d=>  x(d.Year) - works(d.female))
      .attr("y", d=> y(d.f_ratio) - works(d.female))
      .attr("rx", 0)
      .attr("ry", 0)
    //   .attr("fill", colorScale(2) )
    .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
                    d.female > d.male ? d3.schemeSet2[0] : "#aaa"
          )
      .attr('fill-opacity', "0.5")
      .attr("rx", d=> works(d.female)* 2)
      .attr("ry", d=> works(d.female)* 2)
      .attr("height", d=> works(d.female)*2)
        .attr("width", d=> works(d.female)*2)),
      // + HANDLE UPDATE SELECTION
      update => update
      .call(sel => sel
        // .attr("rx", 0)
        // .attr("ry", 0)
        .transition()
        .duration(1000)
        .attr("x", d=>  x(d.Year) - works(d.female))
        .attr("y", d=> y(d.f_ratio) - works(d.female))
        // .attr("fill", colorScale(2) )
        .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
                    d.female > d.male ? d3.schemeSet2[0] : "#aaa"
          )
        .attr('fill-opacity', "0.5")
        .attr("rx", d=> works(d.female)* 2)
        .attr("ry", d=> works(d.female)* 2)
        .attr("height", d=> works(d.female)*2)
        .attr("width", d=> works(d.female)*2)),
      // + HANDLE EXIT SELECTION
      exit => exit
      .call(sel => sel
        .attr("rx", d=> works(d.female)* 2)
        .attr("ry", d=> works(d.female)* 2)
        .transition()
        .duration(1000)
        .attr("height", 0)
        .attr("width", 0)
        .remove()),
    )
    .on("mouseleave", mouseleave )
    .on("mouseover", mouseHover )
   
   
    mdot = svg //male
    .selectAll("rect.male-ratio")
    .data(filteredData, d => d.Year + d.male + d.m_ratio + d.Classification + state.selectedToggle)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("rect")
      .attr("class", "male-ratio")
      .attr("year", d => d.Year)
      .attr("x", d=>  x(d.Year) - works(d.male))
      .attr("y", d=> y(d.m_ratio) - works(d.male))
      .call(sel => sel
        .transition()
        .duration(1000)
      // .delay(1500)
      .attr("x", d=>  x(d.Year) - works(d.male))
      .attr("y", d=> y(d.m_ratio) - works(d.male))
      .attr("rx", 0)
      .attr("ry", 0)
    //   .attr("fill", colorScale(1) )
    .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
    d.female > d.male ? d3.schemeSet2[1] : "#aaa")
      .attr('fill-opacity', "0.5")
      .attr("rx", d=> works(d.male)* 2)
      .attr("ry", d=> works(d.male)* 2)
      .attr("height", d=> works(d.male)*2)
        .attr("width", d=> works(d.male)*2)),
      // + HANDLE UPDATE SELECTION
      update => update
      .call(sel => sel
        .transition()
                .duration(1000)
              // .delay(1500)
        .attr("class", "male-ratio")
        .delay((d,i) => {return i*delaySet})
      .attr("year", d => d.Year)
      .attr("x", d=>  x(d.Year) - works(d.male))
      .attr("y", d=> y(d.m_ratio) - works(d.male))
    //   .attr("fill", colorScale(1) )
    .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
    d.female > d.male ? d3.schemeSet2[1] : "#aaa")
      .attr('fill-opacity', "0.5")
        .attr("rx", d=> works(d.male)*2)
        .attr("ry", d=> works(d.male)*2)
        .attr("height", d=> works(d.male)*2)
        .attr("width", d=> works(d.male)*2)),

      // + HANDLE EXIT SELECTION
      exit => exit
        .call(sel => sel
            .attr("rx", d=> works(d.male)* 2)
            .attr("ry", d=> works(d.male)* 2)
            .transition()
            .duration(1000)
            .attr("height", 0)
            .attr("width", 0)
        .remove()),
    )
    .on("mouseleave", mouseleave )
    .on("mouseover", mouseHover )
   }
   

function bars() { //Function for the bar chart version of the data
    filteredData = state.data
    .filter(d => d.Classification === state.selectedClassification)
    state.selectedChart = "Bars";

    d3.select('#init-y-axis')
    .remove();
    d3.selectAll('.parity')
    .transition()
    .duration(600)
    .remove();
    d3.select("#y-axis-label")
    .remove();

    d3.select('#intro-swap')
    .transition()
    .duration(500)
    .style("opacity","0")
    .transition()
    .duration(500)
    .text("This chart lists the number of unique artists acquired for the Museum of Modern Art (MoMA) collections each year since 1929, broken out by the genders identified in the MoMA data.")
    .style("opacity","1");


   const yM = d3.scaleLinear()
    .domain([0, d3.max(filteredData, d => Math.max(d.female,d.male))])
    .rangeRound([(height-margin.top+margin.bottom) / 2, margin.bottom])
    .nice();
    
    const yF = d3.scaleLinear()
      .domain(yM.domain())
      .range([((height-margin.top+margin.bottom) / 2), height - margin.bottom])
      .nice();

      g1 = svg.append("g").attr('class', 'y-axis-top');
      g2 = svg.append("g").attr('class', 'y-axis-bottom');
      
      yAxis2 = d3.axisLeft(yM).ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 1 : 8)
      .tickFormat(function(e){if(Math.floor(e) != e) {return;} return e;});
      yAxis3 = d3.axisLeft(yF).ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 1 : 8)
      .tickFormat(function(e){if(Math.floor(e) != e) {return;} return e;});
      
      svg.select('.y-axis-top')
      .attr("transform", `translate(${margin.left},${0})`)
      .style("font-size", "1.6em")
      .transition()
      .duration(1000)
      .call(yAxis2);

      svg.select('.y-axis-bottom')
      .attr("transform", `translate(${margin.left},${0})`)
      .style("font-size", "1.6em")
      .transition()
      .duration(1000)
      .call(yAxis3);

      svg.append("text") // Y axis label
      .attr("id", "y-axis-label")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x",0-height/2)
      .attr("dy", "2em")
      .style("text-anchor", "middle")
      .style("font-size", "1.2em")
      .style("opacity", "0")
      .transition()
      .duration(1200)
      .style("opacity", "1")
      .text("Count of artists collected each year");

        // Draw the gridlines
      gridTop = svg.append("g").attr("class", "grid-top bar-grid");
      gridBottom = svg.append("g").attr("class", "grid-bottom bar-grid");
      GridT = () => d3.axisLeft().scale(yM);
      GridB = () => d3.axisLeft().scale(yF);
      
      svg.select('.grid-top')
        .attr("transform", `translate(${margin.left},${0})`)
          .style("stroke", "#333")
          .style("stroke-width", "0.3px")
          .style("stroke-opacity", "0.3")
          .transition()
          .duration(1500)
          .call(GridT()
            .tickSize(-width+margin.left, 0, 0)
            .tickFormat("")
            .ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 0 : 8)
      );
      svg.select('.grid-bottom')
        .attr("transform", `translate(${margin.left},${0})`)
          .style("stroke", "#333")
          .style("stroke-width", "0.3px")
          .style("stroke-opacity", "0.3")
          .transition()
          .duration(1500)
          .call(GridB()
            .tickSize(-width+margin.left, 0, 0)
            .tickFormat("")
            .ticks(d3.max(filteredData, d => Math.max(d.female,d.male)) <= 5 ? 0 : 8)
      );
      
      mouseHover = function(event, d) {
        tooltip
        .style('opacity', "1")
        .html(`<h3>${d.Year}</h3><b><span style="color:#fc8d62;">Male:</span></b> ${d.male}<br>
        <b> <span style="color:#66c2a5;">Female</span></b>: ${d.female}`)
        .style("left", event.x+30+"px")
        .style("top", event.y+30+"px")
        .transition()
        svg.selectAll(`rect[year="${d.Year}"]`)
        .transition()
        .attr("fill-opacity", "1")
        .attr("fill", d=>  "#aaa" );
      }
    
          mouseleave = function(event,d) {
            tooltip
              .transition()
              .style('opacity', "0");
              svg.selectAll(`rect.male-ratio`)
              .transition()
              .delay(20)
              .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
              d.female > d.male ? d3.schemeSet2[1] : "#aaa")
              svg.selectAll(`rect.female-ratio`)
              .transition()
              .delay(20)
              .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
              d.female > d.male ? d3.schemeSet2[0] : "#aaa")
          }

    // Draw the data elements      
    svg // male
    .selectAll("rect.male-ratio")
    .data(filteredData, d => d.Year + d.male + d.m_ratio + d.Classification + state.selectedToggle)
.join(
    enter => enter
    .append("rect")
    .attr("class", "male-ratio")
    .attr("id", d => `${d.Year}-${d.male}-${d.m_ratio}-${d.Classification}`)
    .attr("year", d => d.Year)
    .attr("x", d=>  x(d.Year))
    .attr("y", d => yM(0))
    .call(sel => sel
        .transition()
        .duration(1000)
        .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
    d.female > d.male ? d3.schemeSet2[1] : "#aaa")
        .attr("x", d=>  x(d.Year))
        .attr("width", 8)
        .attr('fill-opacity', "1")
        .attr("y", d => yM(d.male))
        .attr("height", d => yM(0) - yM(d.male))
        .attr("rx", 0)
        .attr("ry", 0)),
    update => update
    .call(sel => sel
        .transition()
        .duration(1000)
        .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[1] : 
    d.female > d.male ? d3.schemeSet2[1] : "#aaa")
        .attr("x", d=>  x(d.Year))
        .attr("width", 8)
        .attr('fill-opacity', "1")
        .delay((d,i) => {return i*delaySet})
        .attr("y", d => yM(d.male))
        .attr("height", d => yM(0) - yM(d.male))
        .attr("rx", 0)
        .attr("ry", 0)),
    exit => exit
    .call(sel => sel
        .transition()
        .duration(1000)
        .attr("width", 0)
        .remove()))
        .on("mouseleave", mouseleave )
        .on("mouseover", mouseHover )

svg // female
.selectAll("rect.female-ratio")
.data(filteredData, d => d.Year + d.female + d.f_ratio + d.Classification + state.selectedToggle)
.join(
    enter => enter
    .append("rect")
    .attr("class", "female-ratio")
    .attr("id", d => `${d.Year}-${d.female}-${d.f_ratio}-${d.Classification}`)
    .attr("year", d => d.Year)
    .attr("x", d=>  x(d.Year))
    .attr("y", d => yF(0))
    .call(sel => sel        
        .transition()
        .duration(1000)
        .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
                    d.female > d.male ? d3.schemeSet2[0] : "#aaa")
        .attr("x", d =>  x(d.Year))
        .attr("width", 8)
        .attr('fill-opacity', "1")
        .attr("y", d => yF(0))
        .attr("height", d => yF(d.female)-(height/2))
        .attr("rx", 0)
        .attr("ry", 0)),
    update => update
        .call(sel => sel
            .transition()
            .duration(1000)
            .delay((d,i) => {return i*delaySet})
            .attr("x", d=>  x(d.Year))
            .attr("y", d => yF(0))
            .attr("fill", d => state.selectedToggle === false ? d3.schemeSet2[0] : 
                    d.female > d.male ? d3.schemeSet2[0] : "#aaa")
            .attr("height", d => yF(d.female)-(height/2))
            .attr("width", 8)
            .attr('fill-opacity', "1")
            .attr("rx", 0)
            .attr("ry", 0)
            )
    ,
    exit => exit
    .call(sel => sel
        .transition()
        .duration(1000)
      .delay(150)
    .attr("width", 0)
        .remove())
)
.on("mouseleave", mouseleave )
.on("mouseover", mouseHover )

}
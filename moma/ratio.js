/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.9,
  margin = ({top: 10, right: 0, bottom: 20, left: 70})
  
  let state = {
    data: [],
  };

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;

Promise.all([
    d3.csv("moma_ratios.csv", d => {
        // use custom initializer to reformat the data the way we want it
        // ref: https://github.com/d3/d3-fetch#dsv
        return {
            //Year,female,male,nb,ratio,f_ratio,m_ratio
          Year: new Date(d.Year),
          female: +d.female,
          male: +d.male,
          nb: +d.nb,
          ratio: +d.ratio,
          f_ratio: +d.f_ratio,
          m_ratio: +d.m_ratio
        }})
  ]).then(([data]) => {
    state.data = data;
    init();
  });

  function init() {
    console.log(state.data)

    x = d3.scaleTime()
    .domain(d3.extent(state.data, d => d.Year))
    .rangeRound([margin.left, width - margin.right])

    y = d3.scaleLinear()
    .domain([0, d3.max(state.data, d => Math.max(d.f_ratio,d.m_ratio))])
    .rangeRound([height-margin.top, margin.bottom])
    .nice();

    const xAxis2 =  d3.axisBottom(x)
    const xAxis1 =  d3.axisTop(x)
    const yAxis =  d3.axisLeft(y).tickFormat(d3.format(".0%"))
    

    svg = d3.select("#ratio-container")
    .append("svg")
    .attr("width", width - margin.left-margin.right)
    .attr("height", height - margin.bottom-margin.top)
    .attr("viewBox", [-10, 0, width+50, height+10])
    // .style("font-family", "Neue Haas Grotesk")
    .style("font-weight", "bold")

    svg.append("g")
    .attr("transform", `translate(0,${margin.bottom})`)
    .style("font-size", "1.6em")
    .call(xAxis1);
    svg.append("g")
    .attr("transform", `translate(0,${height-margin.top})`)
    .style("font-size", "1.6em")
    .call(xAxis2);
    svg.append("g")
    .attr("transform", `translate(${margin.left},${0})`)
    .style("font-size", "1.6em")
    .call(yAxis);

    colorScale = d3.scaleOrdinal(d3.schemeSet2);
  
    works = d3.scaleSqrt()
      .domain([0, d3.max(state.data, d => Math.max(d.female,d.male))])
       .range([1,45]);

  // Add the line with arrowhead at the end
  svg
    .append('path')
    .attr('d', d3.line()([[margin.left,height/2 + margin.top /2+1], [width, height/2 + margin.top /2 +1]]))
    .attr('stroke', 'black')
    // .attr('marker-end', 'url(#arrow)')
    .attr('fill', 'none');

    svg.append("text")
	.text("Parity of Collected Genders")
    // .style("font", "white")
	.attr("x", width/2)
	.attr("y", height/2 + margin.top /2 -12);

    tooltip = d3.select("#ratio-container")
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
    .html(`<h3>${d3.timeFormat('%Y')(d.Year)}</h3>
            <b style="color:#66c2a5;">Female</b>: ${d.female}
            <br> <b style="color:#fc8d62;">Male</b>: ${d.male}`)
    .style("left", event.x + 70 + "px") 
    .style("top", d3.select(this).attr("cy") + "px")
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
  


    draw();
  }
  function draw() {

    const fdot = svg //female
    .selectAll("circle.female-ratio")
    .data(state.data, d => d.Year + d.female)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("circle")
      .attr("class", "female-ratio")
      .attr("cx", d=>  x(d.Year))
      .attr("cy", d=> y(d.f_ratio))
      .attr("fill", d=>  colorScale(2) )
      .attr('fill-opacity', "0.7")
          .call(sel => sel
                .transition()
                .duration(2500)
              // .delay(1500)
               .attr("r", d=> works(d.female))
               ),
      // + HANDLE UPDATE SELECTION
      update => update,

      // + HANDLE EXIT SELECTION
      exit => exit
      .call(sel => sel
        .transition()
        .duration(1500)
        .attr("r", 0)
        .remove()),
    )
    .on("mouseleave", mouseleave )
    .on("mouseover", mouseHover )
    const mdot = svg //male
    .selectAll("circle.male-ratio")
    .data(state.data, d => d.Year + d.male)
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("circle")
      .attr("class", "male-ratio")
      .attr("cx", d=>  x(d.Year))
      .attr("cy", d=> y(d.m_ratio))
      .attr("fill", d=>  colorScale(1) )
      .attr('fill-opacity', "0.7")
          .call(sel => sel
                .transition()
                .duration(2500)
              // .delay(1500)
              .attr("r", d=> works(d.male))
               ),
      // + HANDLE UPDATE SELECTION
      update => update,

      // + HANDLE EXIT SELECTION
      exit => exit
      .call(sel => sel
        .transition()
        .duration(1500)
        .attr("r", 0)
        .remove()),
    )
    .on("mouseleave", mouseleave )
    .on("mouseover", mouseHover )
}


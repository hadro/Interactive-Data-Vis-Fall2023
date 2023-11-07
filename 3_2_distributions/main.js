/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 100, right: 200 }, 
  radius = 5;

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

/* APPLICATION STATE */
let state = {
  data: [],
  selectedGender: "All", // + YOUR INITIAL FILTER SELECTION
  selectedNationality: "All"
};

/* LOAD DATA */
d3.csv("../data/MoMA_distributions.csv", d3.autoType).then(raw_data => {
  // + SET YOUR DATA PATH
  console.log("data", raw_data);
  // save our data to application state
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
xScale = d3.scaleLog()
  .domain([3,1100])
  .range([margin.left, width - margin.right])


yScale = d3.scaleLog([1,400],[height - margin.bottom, margin.top])

colorScale = d3.scaleOrdinal(d3.schemeSet2);
  
lifespan = d3.scaleSqrt()
  .domain(
   d3.extent(state.data.filter(function(d){ return (
        d["Artist Lifespan"] > 0 && d["Artist Lifespan"] < 100
        ) }), d => d["Artist Lifespan"]
   ))
   .range([5,30])

  // + AXES
  const yAxis =  d3.axisLeft(yScale).tickArguments([5,".0s"]);
  const xAxis =  d3.axisBottom(xScale).tickArguments([5,".0s"]);

  // + UI ELEMENT SETUP
  
  const selectElementNationality = d3.select("#dropdown-nationality")
  const selectElementGender = d3.select("#dropdown-gender")

  selectElementNationality
    .selectAll("option")
    .data([...Array.from(new Set(state.data.map(d => d.Nationality))), "All"])
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

    selectElementNationality
    .on("change", event => {
      // console.log(event.target.value);
      state.selectedNationality = event.target.value;
      draw();
    })


  // + CREATE SVG ELEMENT
  svg = d3.select("#container")
  .append("svg")
  .attr("width", width - margin.left)
  .attr("height", height - margin.bottom)
  .attr("viewBox", [0, 0, width, height]);

  // + CALL AXES
  svg.append("g")
  .attr("transform", "translate(0, "
         + (height - margin.bottom) + ")")
 .call(xAxis)
 .selectAll(".tick text")
 .attr("font-size","1.5em")

svg.append("g")
 .call(yAxis)
 .attr("transform", `translate( ${margin.left} , 0)`)
 .selectAll(".tick text")
  .attr("font-size","1.5em")

svg.append("text")
     .attr("transform", "rotate(-90)")
     .attr("y", 20)
     .attr("x",0-height/2)
     .attr("dy", "2em")
     .style("text-anchor", "middle")
     .text("Width (cm) [Log scale]");

  svg.append("text")      // text label for the x axis
  .attr("x", (width / 2)) 
  .attr("y", height-margin.bottom+40 )
  .style("text-anchor", "middle")
  .text("Length (cm) [Log scale]");

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
  .html(`${d.Title} by <span style="color: ${colorScale(d.Gender)} ;">${d.Artist}</span>`)
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


  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this every time there is an update to the data/state
function draw() {

  // + FILTER DATA BASED ON STATE
  const filteredData = state.data
    .filter(d => state.selectedGender === "All" || state.selectedGender === d.Gender)
    .filter(d => state.selectedNationality === "All" || state.selectedNationality === d.Nationality)
  const dot = svg
    .selectAll("circle.artist")
    .data(filteredData, d => d.Title + d.Artist + d.Date + d['Length (cm)']+d['Width (cm)']+d["Gender"])
    .join(
      // + HANDLE ENTER SELECTION
      enter => enter
      .append("circle")
      .attr("class", "artist")
      .attr("cx", d=>  xScale(d['Length (cm)']))
      .attr("cy", d=> yScale(d['Width (cm)']))
      .attr("fill", d=>  colorScale(d["Gender"]) )
      .attr('fill-opacity', "0.3")
          .call(sel => sel
                .transition()
                .duration(2500)
              // .delay(1500)
               .attr("r", d=> (43 <= d['Artist Lifespan'] && d['Artist Lifespan'] <= 97) ? lifespan(d['Artist Lifespan']) : 4)
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
    
;
}
/** CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };

let svg;
let tooltip;

/** APPLICATION STATE */
let state = {
  data: null,
  hover: null
};

/** LOAD DATA */
d3.json("../data/flare.json", d3.autotype).then(data => {
  state.data = data;
  init();
});

/** INITIALIZING FUNCTION */
function init() {

  const colorScale = d3.scaleOrdinal(d3.schemeSet1);
  // console.log(state.data)

  const container = d3.select("#container").style("position", "relative");

  tooltip = container.append("div")
    .attr("class", "tooltip")
    .style("position", "absolute")
    .style("top", 0)
    .style("left", 0)

  svg = container
    .append("svg")
    .attr("width", width)
    .attr("height", height);

   // create root based on hierarchy
   const root = d3.hierarchy(state.data)
    .sum(d => d.value)
    .sort((a, b) => b.value - a.value);

  // console.log(root)


  const packGen = d3.pack()
  .size([width, height])
  .padding(3)

  packGen(root)


  const descendants = root.descendants();

    // console.log(descendants)


  
    const circles = svg.selectAll("circle.pack")
      .data(descendants)
      .join("circle")
      .attr("class", "pack")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", d => d.r)
      .attr("stroke", d => d.children ? '#ccc' : null)
      .attr("fill", d => colorScale(d.children))// ? 'transparent' : "chucknorris")
      .attr("fill-opacity", 0.8)
      .on("mouseenter", (event, d) => {
        // console.log(event, d)
        state.hover = {
          position: [event.x, event.y - 100],
          name: d.data.name,
          parent: d.parent ? d.parent.data.name : "No parent",
          value: d.data.value ? d.data.value : "No value"
        }
        draw();
      })

  draw(); // calls the draw function
}

/** DRAW FUNCTION  */
function draw() {

  if (state.hover) {
    tooltip.html(
      `<div>Name: ${state.hover.name}</div>
      <div>Parent: ${state.hover.parent}</div>
      <div>Value: ${state.hover.value}</div>`
    )
    .transition()
    .duration(100)
    .style("transform", `translate(${state.hover.position[0]}px, ${state.hover.position[1]}px )`)
  }


}
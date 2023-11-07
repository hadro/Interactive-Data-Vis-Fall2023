/**
 * CONSTANTS AND GLOBALS
 * */

const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 50, bottom: 50, left: 50, right: 50 };


/**
* APPLICATION STATE
* */
let state = {
  geojson: [],
  nationalities: [],
  data: [],
  hover: {
    country: null,
    count: null
  },
};
let svg;
let n; 
let projection;
let color;
let counts;
let path;
let allCountries;
let fillCountries;
let legend;

/**
* LOAD DATA
* Using a Promise.all([]), we can load more than one dataset at a time
* */
Promise.all([
  d3.json("../data/world.json"),
  d3.csv("../data/merged_nationality.csv", d3.autoType),
]).then(([geojson, nationalities]) => {
  state.geojson = geojson;
  state.nationalities = nationalities;
  console.log("state: ", state);
  init();
});

/**
* INITIALIZING FUNCTION
* this will be run *one time* when the data finishes loading in
* */
function init() {
 
  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // SPECIFY PROJECTION
projection = d3.geoNaturalEarth1() 
    .fitSize([
      width-margin.left-margin.right,
      height-margin.top-margin.bottom
    ], state.geojson); 

// set color scale
// const color = d3.scaleThreshold()
color = d3.scaleSequential(d3.extent(state.nationalities, d => d.Count), d3.interpolateBlues).nice();
        // .domain(d3.extent(nationalities, d => d.Count))
        // .range(["#DCE9FF", "#8EBEFF", "#0072BC"])

// Define size scale
counts = d3.scaleSqrt()
.domain([1, 5191])
 .range([5,30])


  // DEFINE PATH FUNCTION
path = d3.geoPath(projection)

n = []

  state.nationalities.forEach(d => {
    n.push(d.country)
  });
  
  state.nationalities.forEach(function(d){
    if (state.data[d.country]){
      state.data[d.country] = state.data[d.country] + +d.Count
    } else {
      state.data[d.country] = +d.Count
  }
  });

//  APPEND GEOJSON PATH  
allCountries = svg.selectAll("path.all-countries")
 .data(state.geojson.features)
 .join("path")
 .attr("class", 'all-countries')
 .attr("stroke", "black")
 .attr("fill", "transparent")
 .attr("d", path)


function picnicFilter(feature) {
 if (state.data[feature.properties.name]) return true
}

mouseover = (mouseEvent, d) => {
  // when the mouse rolls over this feature, do this
  state.hover["country"] = d.properties.name;
  state.hover["count"] = state.data[d.properties.name];
  draw(); // re-call the draw function when we set a new hoveredState
}; 

mouseleave = (mouseEvent, d) => {
  // when the mouse rolls over this feature, do this
  state.hover["country"] = null;
  state.hover["count"] = null;
  draw(); // re-call the draw function when we set a new hoveredState
}; 


//  APPEND GEOJSON PATH  
fillCountries = svg.selectAll("path.fill-countries")
//  .data(state.geojson.features)
 .data(state.geojson.features.filter(d => picnicFilter(d)))
 .join("path")
 .attr("class", 'fill-countries')
 .attr("stroke", "black")
 .attr("fill", d => {if(color(state.data[d.properties.name])){return d.properties.name in state.data ? color(state.data[d.properties.name]) : "transparent"} else{return "transparent"} })
 .attr("d", path)
.on("mouseover", mouseover) 
.on("mouseleave", mouseleave)
.transition()
.delay(2000)
.duration(200)


//  APPEND DATA AS SHAPE
//  prepare pop data to join shapefile

//  svg.selectAll("circle")
//    .data(state.geojson.features.filter(d => picnicFilter(d)))
//    .join(
//    enter => enter
//      .append("circle")
//        .attr("transform", function(d) {
//          let coords = path.centroid(d.geometry);
//          return `translate(${coords[0]}, ${coords[1]})`
//        })
//        .attr("r", d => counts(state.data[d.properties.name]))
//        .attr("fill", d=> color(state.data[d.properties.name]))
//        .attr('fill-opacity', "0.99")
//        .attr("stroke", "black")
//        )
//        .on("mouseover", mouseover)
//        .on("mouseleave", mouseleave)
//        .transition()
//     .delay(2000)
//   .duration(200)
       
       

// function picnicFilter(feature) {
//  if (state.data[feature.properties.name]) return true
// }

// console.log(state.geojson.features.filter(d => picnicFilter(d)))

// set legend
svg.append("g")
 .attr("class", "legendThreshold")
 .attr("transform", "translate(5,355)");

legend = d3.legendColor()
.labelFormat(d3.format(",.0f"))
.labels(d3.legendHelpers.thresholdLabels)
.labelOffset(3)
.shapePadding(0)
.scale(color);

svg.select(".legendThreshold")
   .call(legend);


  draw(); // calls the draw function
}

/**
* DRAW FUNCTION
* we call this every time there is an update to the data/state
* */
function draw() {
 console.log(state.hover)
// return an array of [key, value] pairs
hoverData = Object.entries(state.hover);

 d3.select("#hover-content")
   .selectAll("div.row")
   .data(hoverData)
   .join("div")
   .attr("class", "row")
   .html(
     d =>
       // each d is [key, value] pair
       d[1] // check if value exist
         ? `<strong>${d[0]}</strong>: ${d[1]}` // if they do, fill them in
         : null // otherwise, show nothing
   );

}
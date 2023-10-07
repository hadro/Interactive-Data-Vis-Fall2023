/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.9,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 };


/**
 * LOAD DATA
 * Using a Promise.all([]), we can load more than one dataset at a time
 * */
 Promise.all([
  d3.json("../data/world.json"),
  d3.csv("../data/merged_nationality.csv", d3.autoType),
]).then(([geojson, nationalities]) => {
  
  // create an svg element in our main `d3-container` element
  svg = d3
    .select("#container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // SPECIFY PROJECTION
  const projection = d3.geoNaturalEarth1() 
    .fitSize([
      width-margin.left-margin.right,
      height-margin.top-margin.bottom
    ], geojson); 

// set color scale
// const color = d3.scaleThreshold()
const color = d3.scaleSequential(d3.extent(nationalities, d => d.Count), d3.interpolateBlues).nice();
        // .domain(d3.extent(nationalities, d => d.Count))
        // .range(["#DCE9FF", "#8EBEFF", "#0072BC"])

        // .unknown("#ffE6E6");
// const color = d3.scaleLinear()
//         .domain(d3.extent(nationalities, d => d.Count))
//         .range(["white", "blue"])
//         .unknown("#E6E6E6");
// const color = d3.scaleQuantize()
  // .domain(d3.extent(nationalities, d => d.Count)) // pass only the extreme values to a scaleQuantize’s domain
  // .range(["white", "pink", "red","yellow","orange","green","violet","lightred"])

  // DEFINE PATH FUNCTION
  const path = d3.geoPath(projection)

  const n = []

  nationalities.forEach(d => {
    n.push(d.country)
  });
  
  const data = {};
  nationalities.forEach(function(d){
    if (data[d.country]){
      data[d.country] = data[d.country] + +d.Count
    } else {
    data[d.country] = +d.Count
  }
  });


//MUCH help from: https://dataviz.unhcr.org/tools/d3/d3_choropleth_map.html

  // APPEND GEOJSON PATH  
  const allCountries = svg.selectAll("path.all-countries")
  .data(geojson.features)
  .join("path")
  .attr("class", 'all-countries')
  .attr("stroke", "black")
  .attr("fill", "transparent")
  .attr("d", path)
  
  // APPEND GEOJSON PATH  
  const fillCountries = svg.selectAll("path.fill-countries")
  .data(geojson.features)
  .join("path")
  .attr("class", 'fill-countries')
  .attr("stroke", "black")
  .attr("fill", d => {if(color(data[d.properties.name])){return console.log(color(data[d.properties.name])), d.properties.name in data ? color(data[d.properties.name]) : "transparent"} else{return "transparent"} })
  .attr("d", path)

  // APPEND DATA AS SHAPE
  // prepare pop data to join shapefile


// set legend
svg.append("g")
  .attr("class", "legendThreshold")
  .attr("transform", "translate(5,355)");

const legend = d3.legendColor()
.labelFormat(d3.format(",.0f"))
.labels(d3.legendHelpers.thresholdLabels)
.labelOffset(3)
.shapePadding(0)
.scale(color);

svg.select(".legendThreshold")
    .call(legend);

});
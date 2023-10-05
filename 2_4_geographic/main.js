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

  // DEFINE PATH FUNCTION
  const path = d3.geoPath(projection)

  const n = []

  nationalities.forEach(d => {
    n.push(d.country)
  });
  

  // APPEND GEOJSON PATH  
  const states = svg.selectAll("path.countries")
  .data(geojson.features)
  .join("path")
  .attr("class", 'countries')
  .attr("stroke", "black")
  .attr("fill", d => {return n.indexOf(d.properties.name) >= 0 ? "blue" : "transparent"})
  .attr("d", path)
  
  // APPEND DATA AS SHAPE

});

/* CONSTANTS AND GLOBALS */
const width = window.innerWidth *0.8;
const height = 500;
margin = ({top: 20, right: 30, bottom: 30, left: 5})

/* LOAD DATA */
d3.csv('../data/MoMA_topTenNationalities.csv', d3.autoType)
   .then(data => {
    //  console.log("data", data)

    /* SCALES */
    /** This is where you should define your scales from data to pixel space */
  // xscale - categorical, activity
  const yScale = d3.scaleBand()
  .domain(data.map(d=> d.Nationality))
  .range([height - margin.bottom-margin.top - 20, margin.bottom]) // Reversing the order so the largest is next to the x axis
  .paddingInner(.2)

  const xScale = d3.scaleLinear()
  .domain([0, d3.max(data, d=> d.Count)])
  .range([margin.left,width]) // visual variable
  
  const yAxis =  d3.axisLeft(yScale);
  const xAxis =  d3.axisBottom(xScale);

  const color = d3.scaleOrdinal(d3.schemeCategory10);

  /* HTML ELEMENTS */
    /** Select your container and append the visual elements to it */
    const svg = d3.select("#container")
    .append("svg")
    .attr("width", width - margin.left)
    .attr("height", height - margin.bottom)
    .attr("viewBox", [-50, 0, width, height]);

  // bars
  svg.selectAll("rect.bar")
    .data(data)
    .join("rect")
    .attr("class", "bar")
    .attr("width", d=>  xScale(d.Count))
    .attr("height", d=> yScale.bandwidth())
    .attr("x", margin.left)
    .attr("y", d=> yScale(d.Nationality))
    //.attr("fill", "red")
    .attr("fill", function(d,i) {
      return color(i);})
      
  svg.select("rect")
    .attr("fill", "url(#locked2)")
    .attr("style", "border: 1px black solid");

    svg.append("g")
     .attr("transform", "translate(0, "
            + (height - margin.top - margin.bottom) + ")")
    .call(xAxis)
    .selectAll(".tick text")
    .attr("font-size","1.5em");


svg.append("g")
    .call(yAxis)
    .selectAll(".tick text")
     .attr("font-size","1.5em");


// A little fun with an image overlaid on the SVG
svg.append("defs")
     .append('pattern')
       .attr('id', 'locked2')
       .attr('patternUnits', 'userSpaceOnUse')
       .attr('width', 46)
       .attr('height',100)
      .append("image")
       .attr("xlink:href", "https://img.freepik.com/free-vector/illustration-usa-flag_53876-18165.jpg?h=24") // having a little fun with a repeating american flag
       .attr('width', 45)
       .attr('height', 24);

// The div version

// This was incredibly helpful here: https://codepen.io/paulbhartzog/pen/MbKJJy

const divvy = d3.select("#div-container")
.append("div")
.attr("width", width - margin.left)
.attr("height", height - margin.bottom)
.attr("viewBox", [0, 0, width, height]);


//d3.select("body").selectAll(".bar")
divvy.selectAll(".bar")
       .data(data)
       .join("bar")
       .append("div")
       .attr("class", "bar")
       .style("width", function(d) {
         var barHeight = d.Count / 3.64;
         return barHeight + "px";
       });
    })

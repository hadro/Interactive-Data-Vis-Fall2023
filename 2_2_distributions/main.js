/* CONSTANTS AND GLOBALS */
const width = window.innerWidth *0.8;
const height = window.innerHeight *0.8;
const margin = ({top: 20, right: 30, bottom: 20, left: 20})


/* LOAD DATA */
d3.csv("../data/MoMA_distributions.csv", d3.autoType)
  .then(data => {
    //console.log(data)

    /* SCALES */
//     const xScale = d3.scaleLog([3,1200], [margin.left, width - margin.right])
    // .domain([0, d3.max(data, d=> d['Length (cm)'])])
    // .range([40,width]) // visual variable
    const xScale = d3.scaleLog()
    .domain([3,1100])
    .range([margin.left, width - margin.right])
//     .tickFormat(10, "")


    const yScale = d3.scaleLog([1,400],[height - margin.bottom, margin.top])
    // .domain([0, d3.max(data, d=> d['Width (cm)'])])
    // .range([height, 100]) // visual variable
  
    const yAxis =  d3.axisLeft(yScale).tickArguments([5,".0s"]);
    const xAxis =  d3.axisBottom(xScale).tickArguments([5,".0s"]);

    const color = d3.scaleOrdinal(d3.schemeSet2);
    //const shape = d3.scaleOrdinal(data.map(d => d.Gender), d3.symbols.map(s => d3.symbol().type(s).size(data, d => (2 <= d['Artist Lifespan'] && d['Artist Lifespan'] <= 100) ? lifespan(d['Artist Lifespan']) : 4)));

    // const lifespan = d3.scaleLinear([43,97],[5,37])
    const lifespan = d3.scaleSqrt()
    .domain(
     d3.extent(data.filter(function(d){ return (
          d["Artist Lifespan"] > 0 && d["Artist Lifespan"] < 100
          ) }), d => d["Artist Lifespan"]
     ))
     .range([5,30])

     /* HTML ELEMENTS */
    const svg = d3.select("#container")
    .append("svg")
    .attr("width", width+ margin.left + margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("viewBox", [0, margin.top, width, height]);



// Try some tooltips to fix the label overlap issue
  // A function that change this tooltip when the user hover a point.
  
  
  const tooltip = d3.select("#container")
  .append("div")
  .style("opacity", 0)
  .attr("class", "tooltip")
  .style("background-color", "white")
  .style("border", "solid")
  .style("border-width", "1px")
  .style("border-radius", "5px")
  .style("padding", "10px")
  .style("position", "absolute")

  // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
  const mouseover = function(event, d) {
     tooltip
       .style("opacity", 1)
   }
 
   const mousemove = function(event, d) {
     tooltip
     // console.log(event.x, event.y)
       .html(`${d.Title} by <span style="color: ${color(d.Gender)} ;">${d.Artist}</span>`)
       .style("left", event.x + 70 + "px") 
       .style("top", d3.select(this).attr("cy") + "px")
   }
 
   // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
   const mouseleave = function(event,d) {
     tooltip
       .transition()
       .delay(50)
       .duration(200)
       .style("opacity", 0)
   }

  // bars
  svg.selectAll("circle")
    .data(data, d => d.Artist + d.Title)
     .join(
          enter => enter
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d=>  xScale(d['Length (cm)']))
          .attr("cy", d=> yScale(d['Width (cm)']))
          .attr("fill", d=>  color(d["Gender"]) )
          .attr('fill-opacity', "0.3")
          .call(enter => enter
               .transition()
               .duration(1500)
               .attr("r", d=> (43 <= d['Artist Lifespan'] && d['Artist Lifespan'] <= 97) ? lifespan(d['Artist Lifespan']) : 4)
               ),
          update => update
     )
     .on("mouseover", mouseover )
     .on("mousemove", mousemove )
     .on("mouseleave", mouseleave )



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
     .attr("y", 0 - margin.left-38)
     .attr("x",0 - (height / 2))
     .attr("dy", "1em")
     .style("text-anchor", "middle")
     .text("Width (cm) [Log scale]");

svg.append("text")      // text label for the x axis
     .attr("x", (width / 2)) 
     .attr("y", 830 )
     .style("text-anchor", "middle")
     .text("Length (cm) [Log scale]");

});


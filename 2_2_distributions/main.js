/* CONSTANTS AND GLOBALS */
const width = window.innerWidth *0.8;
const height = window.innerHeight *0.8;
const margin = ({top: 20, right: 30, bottom: 20, left: 20})


/* LOAD DATA */
d3.csv("../data/MoMA_distributions.csv", d3.autoType)
  .then(data => {
    //console.log(data)

    /* SCALES */
    const xScale = d3.scaleLog([3,2000], [margin.left, width - margin.right])
    // .domain([0, d3.max(data, d=> d['Length (cm)'])])
    // .range([40,width]) // visual variable
    


    const yScale = d3.scaleLog([1,750],[height - margin.bottom, margin.top])
    // .domain([0, d3.max(data, d=> d['Width (cm)'])])
    // .range([height, 100]) // visual variable
  
    const yAxis =  d3.axisLeft(yScale);
    const xAxis =  d3.axisBottom(xScale);

    const color = d3.scaleOrdinal(d3.schemeSet2);
    //const shape = d3.scaleOrdinal(data.map(d => d.Gender), d3.symbols.map(s => d3.symbol().type(s).size(data, d => (2 <= d['Artist Lifespan'] && d['Artist Lifespan'] <= 100) ? lifespan(d['Artist Lifespan']) : 4)));

    // const lifespan = d3.scaleLinear([35,100],[5,37])
    const lifespan = d3.scaleSqrt().domain([0, 105]).range([0,25])
    // .domain([0, d3.max(data, d=> d['Artist Lifespan'])])
    // .range([5,97])
 

    /* HTML ELEMENTS */
    const svg = d3.select("#container")
    .append("svg")
    .attr("width", width+ margin.left + margin.right)
    .attr("height", height - margin.top - margin.bottom)
    .attr("viewBox", [0, margin.top, width, height]);

  // bars
  svg.selectAll("circle")
    .data(data)
    .join("circle")
    .attr("cx", d=>  xScale(d['Length (cm)']))
    .attr("cy", d=> yScale(d['Width (cm)']))
    .attr("r", d=> (2 <= d['Artist Lifespan'] && d['Artist Lifespan'] <= 100) ? lifespan(d['Artist Lifespan']) : 4)
    .attr("fill", d=> d["Gender"] != '()' ? color(d["Gender"]) : "rgb(70,165,69)" )
    .attr('fill-opacity', "0.3");

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


const f = d3.format(".0f");

const text = svg.append("g")
     .attr("class", "labels")
   .selectAll("text")
     .data(data)
    .join("text")
    //  .attr("dx", d=>  xScale(d['Length (cm)']))
    //  .attr("dy", d=> yScale(d['Width (cm)']))
     .attr('transform', d=> 'translate('+xScale(d['Length (cm)'])+','+yScale(d['Width (cm)'])+')')
    //  .text(function(d) { return f(d['Length (cm)'])+" x "+ f(d['Width (cm)'])  });
     .text(function(d) { return d.Artist  });

// svg.selectAll("circle")
//   .data(data)
//   .join("label")     // text label for the x axis
//   .attr("class", "label")
//   .attr("cx", d=>  xScale(d['Length (cm)']))
//   .attr("cy", d=> yScale(d['Width (cm)']))
//   .append("svg:title")
//           .text(function(d) { return d.Title});

//       data.forEach(element => {
//         //console.log(element['Artist Lifespan'])
//       });
data.forEach(d => {
  console.log(lifespan(d['Artist Lifespan']))
});
});


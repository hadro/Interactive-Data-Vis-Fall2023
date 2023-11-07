mapboxgl.accessToken = 'pk.eyJ1IjoiaGFkcm8iLCJhIjoiY2xvbHZiaGFhMG44NjJrb2FtNzFjbWF2ZiJ9.rOR3xXbmAy6BJO-IAukV1g';

const world = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/hadro/clom9lzai002401qd89pt5odp', // style URL
  center: [0, 0], // starting position [lng, lat]
  zoom: 1, // starting zoom
});

// const gc = new mapboxgl.Marker()
//   .setLngLat([-73.9833, 40.7423])
//   .setPopup(new mapboxgl.Popup().setHTML(
//     `
//     <h3>Graduate Center</h3>
//     <div>City University of New York</div>
//     <div>365 5th Ave, New York, NY 10016</div>
//     <div>Coordinates: [-73.9833, 40.7423]</div>
//     `
//   ))
//   .addTo(usThing)

Promise.all([
d3.json("../data/merge__World_Citi__merged_nat.geojson"),
// d3.csv("../data/merged_nationality.csv", d3.autoType)
// ]).then(([geojson, nationalities]) => {
]).then(([geojson]) => {
    // console.log(nationalities)

    // const heatSpots = data.map()
    geojson.features
    .filter(point => point.properties['STATUS'] === "National and provincial capital" || point.properties['STATUS'] === "National capital")
    .filter(point => point.properties.Count)
    .forEach(point => {
        // console.log(point)
        // console.log(point.properties.CNTRY_NAME,point.properties.CITY_NAME)
      new mapboxgl.Marker({
        scale: 0.5,
        // color: colorScale(point['Change in 95 percent Days'])
      })
        .setLngLat([point.geometry.coordinates[0], point.geometry.coordinates[1]])
        .setPopup(new mapboxgl.Popup().setHTML(`
            <h4>${point.properties.CNTRY_NAME}</h4>  
            <div>Capital: ${point.properties.CITY_NAME}</div>
          <div>Count: ${point.properties.Count}</div>
          <div>Capital population: ${point.properties.POP}</div>
        `))
        .addTo(world)
    })
  })
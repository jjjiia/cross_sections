
$(function() {
  	queue()
      //.defer(d3.json,"cities.json")
      //.defer(d3.json,"data_census/keys_women_language_income_filtered.json")
     //// .defer(d3.json,"dictionary_birth.json")
      //.defer(d3.csv,"data_census/blockGroup.csv")
      //.defer(d3.csv,"data_census/tract.csv")
      //.defer(d3.csv,"data_census/county.csv")
      //.defer(d3.csv,"data_census/state.csv")
      //.defer(d3.csv,"data_geocounts/county_counts.csv")
      //.defer(d3.csv,"data_geocounts/states_counts.csv")
      //.defer(d3.csv,"data_geocounts/tracts_counts.csv")
      .await(dataDidLoad);
  })



function dataDidLoad(error) {  

    var center = [-74.0059413,40.7127837]
    var bounds = [
        [-126.098852, 33.815507], // Southwest coordinates
        [-58.071510, 46.573835]  // Northeast coordinates
    ];
    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjdkrxmwl008v2to3t0e8g0k0',
        center: center,
        maxZoom: 21,
        minZoom: 3,
        zoom:12
    });
    
    map.on('load', function() {
     //draw a line on the map
        drawLine(map)
        //load a data polygon on the map
        //detect intersection of those things
        //trigger data function
        //then look into directions between 2 points
    })
}
function drawLine(map){
    var draw = new MapboxDraw({
        displayControlsDefault: false,        
        controls: {
            polygon: true,
            trash: true
        },
    });

    map.addControl(draw);
    
    
    
    
}
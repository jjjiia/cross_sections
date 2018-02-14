$(function() {
  	queue()
      .defer(d3.csv,"R11583882_SL150.csv")
      .await(dataDidLoad);
  })
 

  function dataDidLoad(error,censusData){
      var formatted = convertDataToDict(censusData)

    var center = [-73.9,40.7127837]

    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjdkrxmwl008v2to3t0e8g0k0',
        center: center,
        interactive: false,
        zoom:12,
    });
     
    map.on('load', function() {
        addPolygons(map)
            var geoidList = []
        
        var canvas = map.getCanvasContainer()
        var down = false;
        $(document).mousedown(function() {
            down = true;
        }).mouseup(function() {
            down = false;  
        });
        map.on('mouseup',function(){
//            console.log(geoidList.length)
//            console.log(geoidList)
            setupCharts(formatted,geoidList)
            //refresh saved ids 
           geoidList = []
        })
         map.on('mousemove', function (e) {
             if(down!=false){
                 $('html,body').css('cursor','crosshair');
                 getFeatures(e,map,geoidList)
             }
         })
    })
 
}
function setupCharts(data,geoids){
    drawChart(data,geoids,"SE_T057_001")
    
}
function drawChart(data,geoids,column){
    var height = 100
    var svg = d3.select("#charts").append("svg").attr("width",300).attr("height",height)
    var g = svg.append("g")
var y = d3.scaleLinear()
    .domain([0,200000])
    .rangeRound([height, 0]);

//y.domain(d3.extent(data, function(d) { return d[column]; }));

var line = d3.line()
    .x(function(d,i){ return i*10})
    .y(function(d,i){
    return y(data[d.replace("1500000US","15000US")][column])
    })
    
  //  g.selectAll("circle")
  //  .data(geoids)
  //  .enter()
  //  .append("circle")
  //  .attr("cy",function(d){
  //      return y(data[d.replace("1500000US","15000US")][column])
  //  })
  //  .attr("cx",function(d,i){
  //      return i*10
  //  })
  //  .attr('r',20)
    
    g.append("path")
        .datum(geoids)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
      .attr("stroke-width", 1.5)
        .attr("d",line)
}

function convertDataToDict(censusData){
    var formatted = {}
    for(var i in censusData){
        var geoid = censusData[i]["Geo_GEOID"]
        formatted[geoid]=censusData[i]
    }
    return formatted
}
function getFeatures(e,map,geoidList){
      var features = map.queryRenderedFeatures(e.point);
        //              document.getElementById('features').innerHTML = JSON.stringify(features, null, 2);
        var blockGroupLayer = features[0]
        var geoid = blockGroupLayer.properties["AFFGEOID"]
        if(geoidList.indexOf(geoid)==-1){
            geoidList.push(geoid)
        }
        return geoidList
}
function addPolygons(map){
    map.addLayer({
      'id': 'blockGroup',
      'type': 'fill',
      'maxzoom':22,
      'minzoom':0,
        'source': {
            'type': 'geojson',
            'data': 'https://raw.githubusercontent.com/jjjiia/cross_sections/master/newYorkStateBG.geojson'
        },        
        "layout":{},
        "paint":{
                'fill-outline-color':'rgba(0,0,200, .1)',
                'fill-color': 'rgba(200, 100, 240, 0)'
        }
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
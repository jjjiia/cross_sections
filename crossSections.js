$(function() {
  	queue()
      .defer(d3.csv,"data/census_withCentroids_incomeOnly.csv")
      .await(dataDidLoad);
  })
 
var lineCount = 0
 var colors = ["#76cfc0",
"#7142ce",
"#c0dc46",
"#c147c3",
"#6adb69",
"#d7488b",
"#5a9344",
"#605ab1",
"#c4a843",
"#c184cd",
"#d87c34",
"#70a0c9",
"#cd413a",
"#c4d19b",
"#923b5a",
"#4c684b",
"#d2aac3",
"#7b5230",
"#5a526f",
"#cf927e"]
  function dataDidLoad(error,censusData){
      var formatted = convertDataToDict(censusData)

    var center = [-73.9,40.7127837]
    
    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjdkrxmwl008v2to3t0e8g0k0',
        center: center,
        //interactive: false,
        zoom:12,
    });
    map["dragPan"].disable()
    
    map.on('load', function() {
        addPolygons(map)
            var featureList = []
        
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
            lineCount+=1
            if(featureList.length>3){
                var geoIds = []
                var filter = featureList.reduce(function(memo, feature) {
                        memo.push(feature.properties["AFFGEOID"]);
                        geoIds.push(feature.properties["AFFGEOID"])
                        return memo;
                    }, ['in', "AFFGEOID"]);
          
                    map.setFilter("bg-highlighted", filter);
                setupCharts(formatted,geoIds)
                
                drawPath(formatted,geoIds,map)
                
            }
        //    else{
        //        console.log("please draw a line with more areas")
        //    }
            //refresh saved ids 
           featureList = []
        })
         map.on('mousemove', function (e) {
             if(down!=false){
                 $('html,body').css('cursor','crosshair');
                 getFeatures(e,map,featureList)
                 
             }
         })
    })
 
}
function setupCharts(data,geoids){
    drawChart(data,geoids,"SE_T057_001")
    
}
function drawPath(data,geoids,map){
    var pathData = []
    for(var g in geoids){
        var gid = geoids[g].replace("1500000US","15000US")
        var coords = [parseFloat(data[gid].lng),parseFloat(data[gid].lat)]
        pathData.push(coords)
    }
    
    map.addLayer({
    "id": "route_"+lineCount,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": pathData
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color": colors[lineCount],
                "line-width": 2
            }
    })
    
}

function drawChart(data,geoids,column){
//    d3.selectAll("#charts svg").remove()
    var margin = 50
    var height = 100
    var width = 400
    var svg = d3.select("#charts").append("svg").attr("width",width+margin*3).attr("height",height+margin*2)
    svg.append("text").text("Median Household Income").attr("x",10).attr("y",20)
    var g = svg.append("g").attr("transform", "translate(" + margin*2 + "," + margin + ")");
  //  console.log(geoids)
    var max = d3.max(geoids.map(function(d){return parseFloat(data[d.replace("1500000US","15000US")][column])}))
//    console.log(max)
var y = d3.scaleLinear()
    .domain([0,max])
    .rangeRound([height-10, 0]);
var x = d3.scaleLinear()
    .domain([0,geoids.length])
    .range([0,width])
var barWidth = (width-10)/geoids.length
//y.domain(d3.extent(data, function(d) { return d[column]; }));

var line = d3.line()
    .x(function(d,i){ return i*barWidth})
    .y(function(d,i){
        //if(data[d.replace("1500000US","15000US")][column]!=0){
            return y(data[d.replace("1500000US","15000US")][column])
            //}
    })
    
    g.append("path")
        .datum(geoids)
        .attr("fill", "none")
        .attr("stroke",colors[lineCount])
        .attr("stroke-linejoin", "round")
        .attr("d",line)
    
      g.selectAll("circle")
      .data(geoids)
      .enter()
      .append("circle")
      .attr("fill",colors[lineCount])
      .attr("cy",function(d){
          return y(data[d.replace("1500000US","15000US")][column])
      })
      .attr("cx",function(d,i){
          return i*barWidth
      })
      .attr('r',2)
      .on("mouseover",function(d){
          console.log(d)
      })
 g.append("g")
      .call(d3.axisLeft(y).ticks(4))
    .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", -60)
      .attr("x", -50)
      .attr("dy", "0.71em")
      .attr("text-anchor", "middle")
      .text("Income ($)");
     

}

function convertDataToDict(censusData){
    var formatted = {}
    for(var i in censusData){
        var geoid = censusData[i]["Geo_GEOID"]
        formatted[geoid]=censusData[i]
    }
    return formatted
}
function getFeatures(e,map,featureList){
      var features = map.queryRenderedFeatures(e.point,{layers:["blockGroup"]});
      
     // console.log(features)
      
        //              document.getElementById('features').innerHTML = JSON.stringify(features, null, 2);
        var feature = features[0]
        if(feature!=undefined){
            featureList.push(feature)
        }
        var geoid = feature.properties["AFFGEOID"]
        //if(geoidList.indexOf(geoid)==-1){
        //    geoidList.push(geoid)
        //}
        return featureList
}
function addPolygons(map){
    map.addSource('blockGroupGeojson',{
        "type":"geojson",
        "data":'https://raw.githubusercontent.com/jjjiia/cross_sections/master/newYorkStateBG.geojson'
    })
    map.addLayer({
        'id': 'blockGroup',
        'type': 'fill',
        'maxzoom':22,
        'minzoom':0,
        'source': "blockGroupGeojson",        
        "layout":{},
        "paint":{
        'fill-outline-color':'rgba(0,0,200, 0)',
        'fill-color': 'rgba(200, 100, 240, 0)'
        }
    })
    map.addLayer({
            "id": "bg-highlighted",
            "type": "fill",
            "source": "blockGroupGeojson",
            "paint": {
                "fill-outline-color": "rgba(255,0,0,1)",
                "fill-color": "rgba(255,0,0,.5)",
                "fill-opacity": 0.2
            },
            "filter": ["in", "FIPS", ""]
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
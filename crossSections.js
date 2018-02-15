$(function() {
  	queue()
      .defer(d3.csv,"data/census_withCentroids_incomeOnly.csv")
      .await(dataDidLoad);
  })
 
var lineCount = 0
 var colors = ["#76cfc0",
"#7142ce",
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

    var newYork = [-73.9,40.7127837]
    var boston = [-71.043787,42.361212]
    mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjdkrxmwl008v2to3t0e8g0k0',
        center: boston,
        //interactive: false,
        zoom:12
    });
    map["dragPan"].disable()
    map.addControl(new mapboxgl.NavigationControl());
    
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
                 var geoids = []
                 getFeatures(e,map,featureList)
                 
             }
         })
    })
 
}
function getDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180
	var radlat2 = Math.PI * lat2/180
	var theta = lon1-lon2
	var radtheta = Math.PI * theta/180
	var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	dist = Math.acos(dist)
	dist = dist * 180/Math.PI
	dist = dist * 60 * 1.1515
	if (unit=="K") { dist = dist * 1.609344 }
	if (unit=="N") { dist = dist * 0.8684 }
	return dist
}

function getDistances(pathDataId){
    var totalDistance = 0
    var distanceDictionary = {}
    for(var i =0; i <pathDataId.length-1; i++){
        
        if(i<pathDataId.length){
        //    console.log(i)
      //  console.log(pathDataId[parseInt(i+1)])
            var gid1 = pathDataId[i][0]
            var gid2 =pathDataId[i+1][0]
            var coord1 = pathDataId[i][1]
            var coord2 = pathDataId[i+1][1]
            //console.log([i,coord1,coord2])
            var d = getDistance(coord1[1],coord1[0],coord2[1],coord2[0])
            totalDistance+=d
            distanceDictionary[gid2]=totalDistance
        }
    }
    distanceDictionary[pathDataId[0][0]]=0
    distanceDictionary["total"]=totalDistance
    return distanceDictionary
}
function drawPath(data,geoids,map){
    var pathData = []
    var pathDataId = []
    for(var g in geoids){
        var gid = geoids[g].replace("1500000US","15000US")
        var coords = [parseFloat(data[gid].lng),parseFloat(data[gid].lat)]
        pathData.push(coords)
        pathDataId.push([gid,coords])
    }
    var distances = getDistances(pathDataId)
    drawChart(distances, data,geoids,"SE_T057_001")
    
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
    console.log(pathData[0])
    var start = pathData[0]
    var end =  pathData[pathData.length-1]
    map.addSource("points_"+lineCount,{
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": start
                },
                "properties":{
                    "title":"A"
                }
            },{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates":end
                },
                "properties":{
                    "title":"B"
                }
            }]
        }
    });
    map.addLayer({
            "id": "start_"+lineCount,
            "type": "circle",
            "source": "points_"+lineCount,
            "paint": {
                "circle-radius": 8,
                "circle-color": colors[lineCount],
            },
            
            "filter": ["==", "$type", "Point"],
        });
    
    
    
    map.addLayer({
        "id":"start_label_"+lineCount,
        "type":"symbol",
        "source": "points_"+lineCount,
        "layout":{
            "text-field":"{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top",
          //  "text-color":colors[lineCount]
        },
        "paint":{
            "text-color":colors[lineCount]
        }
    })
    
    
    
}

function drawChart(distances,data,geoids,column){
//    d3.selectAll("#charts svg").remove()
    var margin = 30
    var height = 80
    var width = 200
    var svg = d3.select("#charts").append("svg").attr("width",width+margin*3).attr("height",height+margin*2)
    svg.append("text").text("Median Household Income").attr("x",10).attr("y",20)
    svg.append("text").text(Math.round(distances.total*100)/100+" mi").attr("x",width/2+margin).attr("y",height+margin)
    svg.append("text").text("A").attr("x",margin*2).attr("y",height+margin).style("fill",colors[lineCount])
    svg.append("text").text("B").attr("x",margin*2+width).attr("y",height+margin).style("fill",colors[lineCount])

    var g = svg.append("g").attr("transform", "translate(" + margin*2 + "," + margin + ")");
  //  console.log(geoids)
    var max = d3.max(geoids.map(function(d){return parseFloat(data[d.replace("1500000US","15000US")][column])}))
//    console.log(max)
var y = d3.scaleLinear()
    .domain([0,max])
    .rangeRound([height-10, 0]);
var x = d3.scaleLinear()
    .domain([0,distances.total])
    .range([0,width])
var barWidth = (width-10)/geoids.length
//y.domain(d3.extent(data, function(d) { return d[column]; }));

var line = d3.line()
    .x(function(d,i){ 
        var id = d.replace("1500000US","15000US")
        return x(distances[id])
    })
    .y(function(d,i){
        return y(data[d.replace("1500000US","15000US")][column])
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
        var id = d.replace("1500000US","15000US")
            return x(distances[id])
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
      var geoids=[]
      for(var f in featureList){
          var fid = featureList[f].properties["AFFGEOID"].replace("1500000US","15000US")
          geoids.push(fid)
      }
        //              document.getElementById('features').innerHTML = JSON.stringify(features, null, 2);
        var feature = features[0]
        if(feature!=undefined){
            var geoid = feature.properties["AFFGEOID"].replace("1500000US","15000US")
            if(geoids.indexOf(geoid)==-1){
                geoids.push(geoid)
                featureList.push(feature)
            }
        }
        //if(geoidList.indexOf(geoid)==-1){
        //    geoidList.push(geoid)
        //}
        return featureList
}
function addPolygons(map){
    map.addSource('blockGroupGeojson',{
        "type":"geojson",
        "data":'https://raw.githubusercontent.com/jjjiia/cross_sections/master/MA_BG.geojson'
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
                "fill-outline-color": "rgba(0,0,0,1)",
                "fill-color": "rgba(0,0,0,.1)",
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
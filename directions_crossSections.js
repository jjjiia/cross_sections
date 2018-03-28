//zoom level determins geo level
//dropdown for categories
//clear all
//add to top of panel, not bottom
//double check sampling of geos
//a story

//https://www.mapbox.com/mapbox-gl-js/example/polygon-popup-on-click/
$(function() {
  	queue()
      .defer(d3.csv,"data/data_county_with_centroids.csv")
    .defer(d3.csv,"data/data_tract_with_centroids.csv")
    .defer(d3.csv,"data/data_blockgroup_with_centroids.csv")
      .defer(d3.json,"data/dataDictionary_2.json")
      .await(dataDidLoad);
  })
var  panelZ = 100
var currentCategory = "SE_T057_001"
var lineCount = 0
var colors = ["#4bf094","#dd8d64","#e7b02c","#50a633","#1bcb78","#e28327","#4f7f32","#d64728","#37a6a8","#d26140","#339762","#46a78d","#8de3be"]
    var  pan =false
var dataDictionary = null
var tractFormatted =null
var countyFormatted =null
var blockgroupFormatted =null
var valueCategories = ["T012_001","T012_002","T012_003","T057_001"]//not percents 
function dataDidLoad(error,county,tract,blockgroup,dataDictionaryFile){
    tractFormatted = convertDataToDict(tract)
    countyFormatted = convertDataToDict(county)
    blockgroupFormatted = convertDataToDict(blockgroup)
    dataDictionary = dataDictionaryFile

   mapboxgl.accessToken = 'pk.eyJ1IjoiampqaWlhMTIzIiwiYSI6ImNpbDQ0Z2s1OTN1N3R1eWtzNTVrd29lMDIifQ.gSWjNbBSpIFzDXU2X5YCiQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/jjjiia123/cjdkrxmwl008v2to3t0e8g0k0',
        center: [-73.9,40.729],
        zoom:12,
        minZoom:3
    });
   // map["dragPan"].disable()

    var directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      steps: true,
      geometries: 'polyline',
      controls: {instructions: false}
    });
    
    map.on("move",function(){
        var zoomLevel = Math.round(map.getZoom()*100)/100
        if(zoomLevel<5){
            d3.select("#zoom").html("counties are queried at zoom level "+zoomLevel)
        }else if(zoomLevel >5 && zoomLevel<8){            
            d3.select("#zoom").html("tracts are queried at zoom level "+zoomLevel)
        }else{
            d3.select("#zoom").html("blockgroups are queried at zoom level "+zoomLevel)     
        }
    })    
    map.addControl( directions, 'top-right');
    map.addControl(new mapboxgl.ScaleControl({maxWidth: 100,unit: 'imperial'}),"bottom-left"); 
    map.addControl(new mapboxgl.ScaleControl({maxWidth: 100,unit: 'metric'}),"bottom-left"); 
    map.addControl(new mapboxgl.NavigationControl(),"bottom-left");
    
    map.on('load', function() {
        
        setInitialRoute(map)
        
        
        var zoomLevel = Math.round(map.getZoom()*100)/100
        if(zoomLevel<5){
            d3.select("#zoom").html("counties are queried at zoom level "+zoomLevel)
        }else if(zoomLevel >5 && zoomLevel<8){            
            d3.select("#zoom").html("tracts are queried at zoom level "+zoomLevel)
        }else{
            d3.select("#zoom").html("blockgroups are queried at zoom level "+zoomLevel)     
        }
        
        
        var layers =map.getStyle().layers
        d3.select(".directions-reverse").remove()
        d3.select(".mapboxgl-ctrl-logo").remove()
        d3.select(".mapboxgl-ctrl-bottom-right").remove()
        map.setPaintProperty("directions-origin-point","circle-color","#aaaaaa")
        map.setPaintProperty("directions-origin-point","circle-radius",10)
        map.setPaintProperty("directions-destination-point","circle-color","#aaaaaa")
        map.setPaintProperty("directions-destination-point","circle-radius",10)
        map.setPaintProperty("directions-route-line","line-color","#aaaaaa")
        map.setPaintProperty("directions-route-line","line-opacity",.5)
        map.setPaintProperty("directions-route-line","line-width",8)
        map.setFilter( "directions-route-line-alt", ["==", "AFFGEOID", ""]);  
        map.setFilter( "directions-hover-point-casing", ["==", "AFFGEOID", ""]);  
        map.setFilter( "directions-hover-point", ["==", "AFFGEOID", ""]); 
        map.setFilter( "directions-waypoint-point", ["==", "AFFGEOID", ""]); 
        map.setFilter("bg-hover-highlight", ["==", "AFFGEOID", ""]);                    
        map.setFilter("county-hover-highlight", ["==", "AFFGEOID", ""]);                    
        map.setFilter("tract-hover-highlight", ["==", "AFFGEOID", ""]);                    
                      
        getDirectionsData(directions,map)
    })
}

function setInitialRoute(map){
    var origin = [-73.89117799999997,40.74687199]
    var destination = [-73.9984,40.72873400000003]
    var path = [[-73.89115, 40.746875],[-73.891429, 40.746847],[-73.89170, 40.746818],[-73.892, 40.746753],[-73.893588, 40.74662],[-73.89, 40.746428],[-73.89632, 40.746335],[-73.896456, 40.747],[-73.896577, 40.747623],[-73.896739, 40.748414],[-73.896469, 40.748454],[-73.896227, 40.748482],[-73.89509, 40.74663],[-73.895616, 40.74355],[-73.89598, 40.743234],[-73.89743, 40.742086],[-73.900528, 40.739583],[-73.9047, 40.737818],[-73.9088, 40.736516],[-73.9185, 40.735357],[-73.92599, 40.730846],[-73.93342, 40.724993],[-73.946088, 40.719066],[-73.948, 40.717554],[-73.95382, 40.713569],[-73.961159, 40.710364],[-73.96461, 40.711414],[-73.97879, 40.71572],[-73.9853, 40.717701],[-73.98573, 40.717821],[-73.986538, 40.718121],[-73.987377, 40.718388],[-73.988168, 40.718619],[-73.98898, 40.718871],[-73.989728, 40.719109],[-73.99020, 40.719259],[-73.99047, 40.719345],[-73.99124, 40.719572],[-73.99210, 40.719825],[-73.992837, 40.720056],[-73.992237, 40.721248],[-73.9916, 40.722412],[-73.991057, 40.723599],[-73.991006, 40.723738],[-73.99126, 40.723805],[-73.992, 40.724192],[-73.99264, 40.724231],[-73.993437, 40.724505],[-73.9941, 40.724763],[-73.99487, 40.725018],[-73.99528, 40.725151],[-73.99581, 40.725274],[-73.996716, 40.725502],[-73.99757, 40.725875],[-73.99830, 40.726241],[-73.99906, 40.72662],[-73.99986, 40.727008],[-73.9989, 40.72807],[-73.998, 40.728734]]
    drawDirections(path,map)
    var geoids = []
    var featureList = []
    var zoomLevel = map.getZoom()
    
    for(var k in path){        
        var dxy = map.project(path[k])
        if(zoomLevel<5){
            var features = map.queryRenderedFeatures(dxy,{layers:["counties"]});
            var formattedCensus =  countyFormatted
        }else if(zoomLevel >5 && zoomLevel<8){
            var features = map.queryRenderedFeatures(dxy,{layers:["tracts"]});
             var formattedCensus =  tractFormatted
        }else{
            var features = map.queryRenderedFeatures(dxy,{layers:["blockgroups"]});
             var formattedCensus = blockgroupFormatted
        }
        var feature = features[0]
        if(feature!=undefined){
            var geoid = feature.properties["AFFGEOID"]//.replace("1500000US","15000US")
            if(geoids.indexOf(geoid)==-1){
                geoids.push(geoid)
                featureList.push(feature)
            }
        }
    }

  //  addPolygons(map,geoids)
    drawPath(formattedCensus,geoids,map,map.getZoom())
}
function getDirectionsData(directions,map){
    directions.on('route', function (ev) {
    
        d3.select("#initial").remove()
        
        var zoomLevel = map.getZoom()
        lineCount+=1
        var directionsPath = []
        var directionsXY = []
        var data = ev.route[0]["legs"][0]["steps"]
        for(var i in data){
            var intersections = data[i]["intersections"]
            for(var j in intersections){
                //console.log(intersections[j]["location"])
                var xy = map.project(intersections[j]["location"])
                directionsXY.push(xy)
                directionsPath.push(intersections[j]["location"])
            }
        }
        var bounds = directionsPath.reduce(function(bounds, coord) {
                  return bounds.extend(coord);
              }, new mapboxgl.LngLatBounds(directionsPath[0], directionsPath[0]));

      map.fitBounds(bounds, {
          padding: 200
          
         
      });
      map.on("moveend",function(){
          console.log("moveend")
      })
    
        
       drawDirections(directionsPath,map)
        var geoids = []
        var featureList = []
        for(var k in directionsXY){
            var dxy = directionsXY[k]
            if(zoomLevel<5){
                var features = map.queryRenderedFeatures(dxy,{layers:["counties"]});
                var formattedCensus =  countyFormatted
            }else if(zoomLevel >5 && zoomLevel<8){
                var features = map.queryRenderedFeatures(dxy,{layers:["tracts"]});
                 var formattedCensus =  tractFormatted
            }else{
                var features = map.queryRenderedFeatures(dxy,{layers:["blockgroups"]});
                 var formattedCensus = blockgroupFormatted
            }
            var feature = features[0]
            if(feature!=undefined){
                var geoid = feature.properties["AFFGEOID"]//.replace("1500000US","15000US")
                if(geoids.indexOf(geoid)==-1){
                    geoids.push(geoid)
                    featureList.push(feature)
                }
            }
        }

      //  addPolygons(map,geoids)
        drawPath(formattedCensus,geoids,map,map.getZoom())
    })
}

function addPointsForSmoothing(directionsPath){
    
    var morePoints = []
    for(var i in directionsPath){
        if(i<directionsPath.length-1){
            var coords1 = directionsPath[i]
            var coords2 = directionsPath[parseInt(i)+1]
            morePoints.push(coords1)
            
            var lat1 = coords1[1]
            var lng1 = coords1[0]
            var lat2 = coords2[1]
            var lng2 = coords1[0]
            var newCoords1 = midpoint(lat1, lng1, lat2, lng2, .5)
          //  var newCoords2 = midpoint(lat1, lng1, lat2, lng2, .4)
          //  var newCoords3 = midpoint(lat1, lng1, lat2, lng2, .6)
          //  var newCoords4 = midpoint(lat1, lng1, lat2, lng2, .8)
            
         //   console.log(newCoords)
            morePoints.push(newCoords1)
           // morePoints.push(newCoords2)
           // morePoints.push(newCoords3)
           // morePoints.push(newCoords4)
        }
    }
 //   console.log(morePoints.length)
    return morePoints
}

function midpoint(lat1, lng1, lat2, lng2, per) {
     return [lng1 + (lng2 - lng1) * per, lat1 + (lat2 - lat1) * per];
}

function drawDirections(mouseList,map){   
    map.addLayer({
    "id": "mouse_"+lineCount,
            "type": "line",
            "source": {
                "type": "geojson",
                "data": {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "LineString",
                        "coordinates": mouseList
                    }
                }
            },
            "layout": {
                "line-join": "round",
                "line-cap": "round"
            },
            "paint": {
                "line-color":  colors[lineCount%(colors.length-1)],
                "line-opacity":.4,
                "line-width": 4
            }
    })
    var start = mouseList[0]
    var end =  mouseList[mouseList.length-1]
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
                "circle-radius": 3,
                "circle-color": colors[lineCount%(colors.length-1)],
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
        },
        "paint":{
            "text-color":colors[lineCount%(colors.length-1)]
        }
    })
    
}

function recordMouse(map,mouseList,e){
    mouseList.push([e.lngLat.lng,e.lngLat.lat])
    return mouseList
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
            var d = getDistance(coord1[1],coord1[0],coord2[1],coord2[0])
            totalDistance+=d
            distanceDictionary[gid2]=totalDistance
        }
    }
    distanceDictionary[pathDataId[0][0]]=0
    distanceDictionary["total"]=totalDistance
    return distanceDictionary
}
function drawPath(data,geoids,map,drawnZoom){
    var pathData = []
    var pathDataId = []
    for(var g in geoids){
            var gid = geoids[g].replace("00000US","000US")
        if(data[gid]!=undefined && data[gid]!=0){
            var coords = [parseFloat(data[gid].lng),parseFloat(data[gid].lat)]
            pathData.push(coords)
            pathDataId.push([gid,coords])
        }
    }
    var distances = getDistances(pathDataId) 
    var panel = "panel_"+lineCount
    
    d3.selectAll(".panelicon").style("border","4px solid #ffffff")
        panelZ +=2
    
    
    d3.select("#panelSelection").append("div").attr("class","icon_"+panel+" panelicon").style("width","20px").style("height","20px")
    .style("border-radius","10px").style("margin","2px").style("background-color",colors[lineCount]).style("display","inline-block")
    .style("border","1px solid #ffffff")
    .style("cursor","pointer")
    .on("click",function(){
        panelZ +=1
        d3.select("."+panel).style("z-index", panelZ)
        d3.selectAll(".panelicon").style("border","4px solid #ffffff")
        d3.select(".icon_"+panel).style("border","1px solid #ffffff")
    })
    
    var panelDiv = d3.select("#charts").append("div").attr("class",panel+" panel")
    .style("z-index", panelZ)//.style("top",lineCount*15+"px")
    .style("border","1px solid "+colors[lineCount])
    .style("background-color","rgba(255,255,255,.95)")
    .style("margin","5px")
    
d3.select("."+panel).append("div").html("&#10005").style("color",colors[lineCount]).style("font-size","20px")
        .style("float","right")
        .style("padding-right","5px")
        .attr("class",panel)
        .on("click",function(){            
            var className = d3.select(this).attr("class")
            var lineClass = className.split("_")[1]
            d3.select(".panel_"+lineClass).remove()
            d3.select(".icon_panel_"+lineClass).remove()
            map.removeLayer("centroids_"+lineClass)
            map.removeLayer("route_"+lineClass)
            map.removeLayer("start_"+lineClass)
            map.removeLayer("start_label_"+lineClass)
            map.removeLayer("mouse_"+lineClass)            
            $("#mapbox-directions-origin").children('input').attr("text","ts")
        })
    
    for(var k in dataDictionary){
        var title = dataDictionary[k]
        drawChart(distances,data,geoids,k,map, dataDictionary,panel,drawnZoom)
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
                "line-color": colors[lineCount%(colors.length-1)],
                "line-width": 1
            }
    })
    
    
    var features = []
    for(var i in pathData){
        features.push({
            "type":"Feature",
            "geometry":{"type":"Point","coordinates":pathData[i]},
            "properties":{"title":"centroid_"+lineCount+"_"+i}
        })
    }
    var centroidsSource = {"type":"geojson","data":{"type":"FeatureCollection","features":features}}
    //console.log(centroidsSource)
    map.addSource('centroids_'+lineCount,centroidsSource)
    
    map.addLayer({
            "id": "centroids_"+lineCount,
            "type": "circle",
            "source": "centroids_"+lineCount,
            "paint": {
                "circle-radius": 4,
                "circle-color": colors[lineCount%(colors.length-1)],
            },
            "filter": ["==", "$type", "Point"],
        });  
}

function drawChart(distances,data,geoids,column,map,keys,panel,drawnZoom){    
    d3.select("#mapbox-directions-destination-input .geocoder-icon geocoder-icon-search input").html("").style("width","100%")
    
    var height = $('#charts').height();
    if($(this).is(':visible')){
       $("#charts").scrollTo(height);
    }
    
    var margin = 30
    var height = 120
    var width = $("#charts").width()
    
    var svg = d3.select("."+panel).append("svg").attr("width",width).attr("height",height).attr("class","chart_"+lineCount)
    
    var title = dataDictionary[column]
    svg.append("text").text(title).attr("x",10).attr("y",20)
    
    svg.append("text").text(Math.round(distances.total*100)/100+" mi").attr("x",width/2).attr("y",height-10).style("fill",colors[lineCount%(colors.length-1)])
    svg.append("text").text("A").attr("x",margin*2).attr("y",height-10).style("fill",colors[lineCount%(colors.length-1)])
    svg.append("text").text("B").attr("x",width-margin).attr("y",height-10).style("fill",colors[lineCount%(colors.length-1)])

    var filteredData = []
    
    for(var geoid in geoids){
        var gid = geoids[geoid].replace("00000US","000US")
        if(data[gid]!=undefined){
            var value = data[gid][column]
            if(value>0){
                filteredData.push([gid,value])
            }   
        }
    }

    var g = svg.append("g").attr("transform", "translate(" + margin*2 + "," + margin + ")");
    var max = d3.max(geoids.map(function(d){
        if(data[d.replace("00000US","000US")]!=undefined){
            return parseFloat(data[d.replace("00000US","000US")][column])
        }
    }))   
    if(column == "SE_T098_001"){
        var min = d3.min(geoids.map(function(d){
            if(data[d.replace("00000US","000US")]!=undefined){
                return parseFloat(data[d.replace("00000US","000US")][column])
            }
        }))
    }else{
        var min = 0
    }
    var y = d3.scaleLinear()
        .domain([min,max])
        .rangeRound([height-margin*2, 0]);
    var x = d3.scaleLinear()
        .domain([0,distances.total])
        .range([0,width-margin*3])
    var barWidth = (width-10)/geoids.length
    var line = d3.line()
        .x(function(d,i){ 
            return x(distances[d[0]])
        })
        .y(function(d,i){
                return y(d[1])
        })
        g.append("path")
            .datum(filteredData)
            .attr("fill", "none")
            .attr("stroke",colors[lineCount%(colors.length-1)])
            .attr("stroke-linejoin", "round")
            .attr("d",line)
            .attr("class",column)
    
      var tool_tip = d3.tip()
        .attr("class", "d3-tip")
        .offset([-8, 0])
        .html(function(d) { return d[1]; });
      svg.call(tool_tip);
      g.selectAll("circle .first")
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("fill",colors[lineCount%(colors.length-1)])
          .attr("cy",function(d){
              return y(d[1])
          })
          .attr("cx",function(d,i){
            return x(distances[d[0]])
          })
          .attr("class",function(d){return "_"+d[0]})
          .attr('r',3)
      g.selectAll("circle .rollover")
          .data(filteredData)
          .enter()
          .append("circle")
          .attr("fill","red")
          .attr("opacity",0)
          .attr("cy",function(d){
              return y(d[1])
          })
          .attr("class",function(d){
              return "rollover rollover_"+d[0]})
          .attr("cx",function(d,i){
            return x(distances[d[0]])
          })
          .attr('r',7)
          .on('mouseover', function(d){
              if(drawnZoom<5){
                  map.setFilter("county-hover-highlight", ["==",  "AFFGEOID", d[0].replace("000US","00000US")]);
                  var geoName = countyFormatted[d[0]]["Geo_NAME"]
              }else if(drawnZoom >5 && drawnZoom<8){            
                  map.setFilter("tract-hover-highlight", ["==",  "AFFGEOID", d[0].replace("000US","00000US")]);
                  var geoName = tractFormatted[d[0]]["Geo_NAME"]
              }else{
                  map.setFilter("bg-hover-highlight", ["==",  "AFFGEOID", d[0].replace("000US","00000US")]);
                  var geoName = blockgroupFormatted[d[0]]["Geo_NAME"]
              }
              tool_tip.html(geoName+"<br/>"+d[1])
              tool_tip.show()
              d3.select(this).attr("opacity",.3)
          })
          .on('mouseout', function(d){
              d3.select(this).attr("opacity",0)
              if(drawnZoom<5){
                  map.setFilter("county-hover-highlight", ["==",  "AFFGEOID", ""]);
              }else if(drawnZoom >5 && drawnZoom<8){            
                  map.setFilter("tract-hover-highlight", ["==",  "AFFGEOID", ""]);
              }else{
                  map.setFilter("bg-hover-highlight", ["==",  "AFFGEOID", ""]);
              }
              tool_tip.hide()
          });
          
    
        
     g.append("g")
          .call(d3.axisLeft(y).ticks(4))
}
function convertDataToDict(censusData){
    var formatted = {}
    for(var i in censusData){
        var geoid = censusData[i]["Geo_GEOID"]
        formatted[geoid]=censusData[i]
    }
    return formatted
}

function addPolygons(map,geoids){
    var filter = ["in","AFFGEOID"].concat(geoids);
    map.setFilter("bg-hover-highlight", filter);           
  //  map.setPaintProperty("bg-hover-highlight","fill-color",colors[lineCount%(colors.length-1)])
  //  map.setPaintProperty("bg-hover-highlight","fill-opacity",.3)
   // map.setFilter("bg-highlighted", ["==", "AFFGEOID", ""]);                    
//    map.setFilter("bg-hover", ["==", "AFFGEOID", ""]);                    
}
// Creating tile layers for the background map image to our map:

var defaultMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

//layers
// grayscale layer
var grayscale = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 0,
	maxZoom: 20,
	ext: 'png'
});

//watercolor layer
var watercolor = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
	attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
	subdomains: 'abcd',
	minZoom: 1,
	maxZoom: 16,
	ext: 'jpg'
});


//topo layer
var topography = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

//make a basemap object
let basemaps = {
    Grayscale: grayscale,
    "Water Color": watercolor,
    Topography: topography,
    Default: defaultMap
    
}

// map object

var myMap = L.map("map", {
    center: [36.7783, -119.4179],
    zoom: 6,
    layers: [watercolor, defaultMap, grayscale, topography]

});

// Add default map to map 

defaultMap.addTo(myMap);

// get data for tectonic plates and draw maps
//variable to hold tetonic plate layer 

let tectonicplates = new L.LayerGroup();

//call api
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    // console log to make sure data is loaded
    //console.log(plateData);
    // load data using geoJSON and add to tectonic plate layer group
    L.geoJson(plateData, {
        //style
        color: "red",
        weight: 1
    }).addTo(tectonicplates);
});

// add tectonic plates to map
tectonicplates.addTo(myMap);

//variable to hold earthquake layer
let earthquakes = new L.LayerGroup();

//get earthquake data and populate the layergroup
//call api
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(function(earthquakeData){
    //console.log(earthquakeData);
    //plot circles for magnetude radius
    //color dependent on depth
    //function for datapoint colors
    function  dataColor(depth){  
        if (depth > 90)
        return "red";
    else if (depth > 70)
        return "f2743a";
    else if (depth > 50)    
        return "f59c27";
    else if (depth > 30)
        return "f5be27";
    else if (depth > 10)
        return "#ccf527";
    else 
        return "green";
        
    }
    //function for radius
    function radiusSize(mag){
        if (mag  == 0)
            return 1;
        else
            return mag * 5;
    }    
    //styling
    function dataStyle(feature){
        return {
            opactiy: 1,
            fillOpacity: 1,
            fillColor: dataColor(feature.geometry.coordinates[2]),
            color: "000000",
            radius: radiusSize(feature.properties.mag),
            weight: 0.5,
            stroke: true

        }             
    }
    // geoJson data
    L.geoJson(earthquakeData, {
        // making every feature a marker as a circle
        pointToLayer: function(features, latLng){
            return L.circleMarker(latLng);
        },
        // style for markers
        style: dataStyle,
        // popups
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnetude: <b>${feature.properties.mag}</b><br>
                            Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                            Location: <b>${feature.properties.place}</b>`);
        } 
        
    }).addTo(earthquakes);
    

});

// earthquake layer
earthquakes.addTo(myMap);

//add overlay for tectonic plates for earthquakes
let overlays = {
    "Earthquake Data": earthquakes,
    "Tectonic Plates": tectonicplates
};

// layer control
//myMap.addLayer(defaultMap)
L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

// legend for map
let legend = L.control({
    position: "bottomright"
});    

// legend properties
legend.onAdd = function(){
        // div for legend
        let div = L.DomUtil.create("div", "info legend");

        // legend intervals
        let intervals = [-10, 10, 30, 50, 70, 90];
        // legend colors
        let colors = [
            "green",
            "#ccf527",
            "f5be27",
            "f59c27",
            "f2743a",
            "red"
        ];

        // loop for colors and intervals
        for( var i = 0; i < intervals.length; i++)
        {
            // inner html for interval squares and label
            div.innerHTML += "<i style='background: "
            + colors[i]
            + "'></i> "
            + intervals[i]
            + (intervals[i + 1] ? "km - " + intervals[i + 1] + "km <br>" : "+");  
        }

        return div;

};

// add legend to map
legend.addTo(myMap);
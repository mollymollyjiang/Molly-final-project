console.log('molly3');

var m = {t:100,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth - m.l - m.r,
    h = (document.getElementById('canvas').clientHeight - m.t - m.b);

var plot = d3.select('.canvas')
    .append('svg')
    .attr('width', 1800)
    .attr('height', 620)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ m.l+','+ m.t+')');



//Color scale
var scaleColor = d3.scaleLinear().domain([0,700]).range(['#F8F4EF','black']);
var ColorType = d3.scaleOrdinal().domain(["Private room","Entire home/apt","Shared room"])
                .range(["#C55D4F","#537994","#E2C84E"]);


//Mapping
var projection = d3.geoMercator(),
    path = d3.geoPath().projection(projection);
var mapData, isMapDrawn = false;;
    

//d3.map for data
var rate = d3.map();

d3.queue()
    .defer(d3.json, '../data/ma_towns.json')
    .defer(d3.csv, '../data/boston_listings_cleaned.csv', parseData)
    .await(function(err, geo,data){
  

  // console.log(data);

    mapData = geo;

//--------------------------    Implement the code to switch between three datasets
         d3.select('#Room_Type')
         .on('click', function(){
            draw1(data);
        })
         .on("mouseenter",function(d){
            d3.select(this)
            .style("fill","#537994");
         })
         .on("mouseleave",function(d){
            d3.select("fill","#C55D4F");
         });

         d3.select('#Room_Price').on('click', function(){
            draw2(data);
        });
       
        d3.select('#Town').on('click', function(){
            
            draw3(data);

        });


drawMap();
draw1(data);

  });

//--------------------------     Draw the map first      -----------------------------------------



            
  

function drawMap() {
    // Code to draw the map
    projection
      .fitExtent([[-w,-h/5],[w*1.5,h*1.8]],mapData);

    var bostonMap = plot.selectAll(".town")
        .data(mapData.features)
        .enter()
        .append("path").attr("class","town")
        .attr("d",path)     
        .style("fill","darkgrey")
        .style("opacity",".35")
        .style("stroke","white")
        .style("stroke-width","1px");     
 

        bostonMap.on("click",function(d,i){
         console.log(d.properties.TOWN);   
        });
    isMapDrawn = true;
}

function removeMap() {
    d3.selectAll(".town").remove();
    isMapDrawn = false;
}




//--------------------------     Draw type  dots       -----------------------------------------

function draw1(rows){
   
    d3.select(".axisX").remove();
    d3.select(".axisY").remove();
    d3.selectAll(".Node2").remove();
    d3.selectAll(".Node3").remove();

if (!isMapDrawn) { drawMap(); }
var roomType = plot.selectAll(".Node")
    .data(rows, function(d){ return d.roomId;});

roomType.exit().remove();
   
var roomTypeEnter = roomType.enter()
    
  .append('circle')
    .attr('class','Node1')
    .on('click',function(d){
           d3.select(this).classed('highlight',true);
        })
    .on('click',function(d,i){
            console.log(d);
            console.log(i);
            console.log(this);
        })
   
//tooltip
            .on('mouseenter',function(d){
        var tooltip = d3.select('.custom-tooltip');
           
            tooltip.select('.price')
                .html('Price : $' + d.price)
            tooltip.select('.location')
                .html('Location : ' +d.neighbor);

            tooltip.transition().style('opacity',0.8);

            d3.select(this).style('stroke-width','3.5px');

            })
            .on('mousemove',function(d){
        var tooltip = d3.select('.custom-tooltip');
        var xy = d3.mouse( d3.select('.container').node() );
            
            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');

            })
           
            .on('mouseleave',function(d){
        var tooltip = d3.select('.custom-tooltip');
            tooltip.transition(1000).style('opacity',0);

            d3.select(this).style('stroke-width','0px');

            });

roomType.exit().remove(); 
roomTypeEnter
    .merge(roomType)
    .attr('cx',function(d){ return projection([d.lon, d.lat])[0];})
    .attr('cy',function(d){ return projection([d.lon, d.lat])[1];})
    .transition().duration(3000)
    .attr("r",3)
    .style('fill',function(d){return ColorType(d.roomType)})
    .style("opacity",".6")   
   

};



//--------------------------     Draw price  dots       -----------------------------------------

function draw2(rows){

d3.select(".axisX").remove();
d3.select(".axisY").remove();
d3.selectAll(".Node1").remove();
d3.selectAll(".Node3").remove();

if (!isMapDrawn) { drawMap(); }

var priceNode = plot.selectAll(".Node")
    .data(rows, function(d){ return d.roomId;});

priceNode.exit().remove();



var priceNodeEnter = priceNode.enter()
    
    .append('circle')
    .attr('class','Node2')
    .on('click',function(d,i){
            console.log(d);
            console.log(i);
            console.log(this);
        })
   
//tooltip
            .on('mouseenter',function(d){
        var tooltip = d3.select('.custom-tooltip');
           
            tooltip.select('.price')
                .html('Price : $' + d.price)
            tooltip.select('.location')
                .html('Location : ' +d.neighbor);

            tooltip.transition().style('opacity',0.8);

            d3.select(this).style('stroke-width','5px');

            })
            .on('mousemove',function(d){
        var tooltip = d3.select('.custom-tooltip');
        var xy = d3.mouse( d3.select('.container').node() );
            
            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');

            })
           
            .on('mouseleave',function(d){
        var tooltip = d3.select('.custom-tooltip');
            tooltip.transition(1000).style('opacity',0);

            d3.select(this).style('stroke-width','0px');

            }); 

priceNode.exit().remove(); 

var extentPrice = d3.extent(rows,function(d){return d.price});

var scaleSize = d3.scaleSqrt()
            .domain(extentPrice)
            .range([1,20]);


priceNodeEnter
    .merge(priceNode)
    .attr('cx',function(d){ return projection([d.lon, d.lat])[0];})
    .attr('cy',function(d){ return projection([d.lon, d.lat])[1];})
    .transition().duration(3000)
    .attr('r', function(d){
            return scaleSize(d.price);
        })
    .style("fill",function(d){

                return scaleColor(d.price);
        })  
   .style("opacity",".55")

}


//--------------------------  Draw the rooms by town     ---------------------------------------





function draw3(rows){
    removeMap();
    d3.select(".town").remove();
   d3.selectAll(".Node2").remove();
   d3.selectAll(".Node1").remove();
    

//--------------------------   mine the data to set the scale

var roomByTown = d3.nest().key(function(d){return d.town})
    .key(function(d){return d.price })
    .entries(rows);


var axisRoomByTown = roomByTown.map(function(d){
    return d.key;
});
axisRoomByTown = ["Boston", "Belmont", "Winthrop", "Medford", "Newton",  "Brookline", "Everett","Cambridge", "Revere", "Chelsea", "Watertown", "Malden", "Melrose", "Somerville"]


var roomByPrice = d3.nest().key(function(d){return d.price})
    .entries(rows);
roomByPrice.reverse();  

var axisRoomByPrice = roomByPrice.map(function(d){
    return d.key
});



var   scaleX = d3.scaleBand()
            .domain(axisRoomByTown)
            .range([0,1800]);

var   scaleY = d3.scaleLinear()
            .domain([0,800])
            .range([0,h]);
   


var axisX = d3.axisTop()
    .scale(scaleX)
    .tickSize(-h);

var axisY = d3.axisLeft()
    .scale(scaleY)
    .tickSize(-1800);



//--------------------------   Draw axis
plot 
    .append("g")
    .attr("class","axisY")
    .attr('transform','translate(0,30)')
    .style("stroke-dasharray", ("3, 3"))
    .call(axisY);

plot
    .append("g")
    .attr("class","axisX")
    .attr('transform','translate(80,-50)')

    .call(axisX);


//--------------------------    Draw dots
    


    var roomNode = plot.selectAll('.Node3')
        .data(rows,function(d){return d.roomId;});

    roomNode.exit().remove();

roomNode = roomNode.enter()
        .append('circle').attr('class','Node3')
        .merge(roomNode);
roomNode.attr('r',3)
        .transition().duration(4000)
        .attr('cx',function(d){return (200+(Math.random()*50)+scaleX(d.town))})
        .attr('cy',function(d){return (100+scaleY(d.price))})
        .style('fill',function(d){return ColorType(d.roomType)})
        .style('fill-opacity',.7);



roomNode.on('click',function(d,i){
            console.log(d);
            console.log(i);
            console.log(this);
        })
   
//tooltip
            .on('mouseenter',function(d){
        var tooltip = d3.select('.custom-tooltip');
           console.log(tooltip.node())
            tooltip.select('.price')
                .html('Price : $' + d.price)
                tooltip.select('.value')
                .html('reviews : ' +d.reviews)
            tooltip.select('.location')
                .html('Location : ' +d.neighbor);
            

            tooltip.transition().style('opacity',.8);

            d3.select(this).style('stroke-width','3.5px');

            })
            .on('mousemove',function(d){
        var tooltip = d3.select('.custom-tooltip');
        var xy = d3.mouse( d3.select('.container').node() );
            
            tooltip
                .style('left',xy[0]+10+'px')
                .style('top',xy[1]+10+'px');

            })
           
            .on('mouseleave',function(d){
        var tooltip = d3.select('.custom-tooltip');
            tooltip.transition(1000).style('opacity',0);

            d3.select(this).style('stroke-width','0px');

            });







var forceX = d3.forceX()
       .x(function(d){
        return 150+scaleX(d.town);
       });
var forceY = d3.forceY()
      .y(function(d){return 30+scaleY(d.price)});
//var forceY = function(d){return (100+scaleY(d.price))}


var collide = d3.forceCollide()
       .radius(2);

var simulation = d3.forceSimulation(rows)

        .force("positionX",forceX)
        .force('positionY', forceY)

        .force("collide",collide)
        .on("tick",function(){
            roomNode
            .attr('cx',function(d){return d.x})
            .attr('cy',function(d){return d.y})


        });  

}






function parseData(d){
 
    if(!d["town"]){
        return;
    }

    return {
        price:+d["price"],
        id:+d["town_id"],
        neighbor:d["neighborho"],
        lat:+d["latitude"],
        town:d["town"],
        city:d["city"],
        lon:+d["longitude"], 
        roomType:d["room_type"],
        reviews:+d["reviews"],
        roomId: d["room_id"]  

}
 rate.set(d.id,+d.price);
}















var emoColors = {
  'happy': 'purple',
  'angry': 'red',
  'sad': 'blue',
  'disgusted': 'green',
  'fear': 'yellow',
  'surprised': 'pink'
}

function graphData(data, oneHourAgo){
  var vis = d3.select("#visualisation"),
    WIDTH = 1000,
    HEIGHT = 500,
    MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
    },
    xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, (3600)]),
    yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0,1]),
    xAxis = d3.svg.axis().scale(xScale),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

    vis.append("svg:g").attr("class","axis").attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")").call(xAxis);
    vis.append("svg:g").attr("class","axis").attr("transform", "translate(" + (MARGINS.left) + ",0)").call(yAxis);
    for (emotion in emoColors){
      var lineGen = d3.svg.line()
        .x(function(d) {
          return xScale((d.timestamp - oneHourAgo)/1000);
        })
        .y(function(d) {
          return yScale(d[emotion]);
        })
        .interpolate("basis");

      vis.append('svg:path')
        .attr('d', lineGen(data))
        .attr('stroke', emoColors[emotion])
        .attr('stroke-width', 2)
        .attr('fill', 'none');
    }
}

document.addEventListener('DOMContentLoaded', function() {
  var oneHourAgo = Date.now() - (1000 * 60 * 60)
  var db = chrome.extension.getBackgroundPage().db;
  db.emotions.where('timestamp').above(oneHourAgo).toArray().then(function(data){
    graphData(data, oneHourAgo);
  }).catch(function(){
    console.log("error");
  });
});

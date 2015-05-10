var emoColors = {
  'happy': 'purple',
  'angry': 'red',
  'sad': 'blue',
  'disgusted': 'green',
  'fear': 'yellow',
  'surprised': 'pink'
}

function graphData(data, tenMinAgo){
  var vis = d3.select("#visualisation"),
    WIDTH = 1000,
    HEIGHT = 500,
    MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
    },
    xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, 600]),
    yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0,1]),
    xAxis = d3.svg.axis().scale(xScale),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

    vis.append("svg:g").attr("class","axis").attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")").call(xAxis);
    vis.append("svg:g").attr("class","axis").attr("transform", "translate(" + (MARGINS.left) + ",0)").call(yAxis);
    for (emotion in emoColors){
      var lineGen = d3.svg.line()
        .x(function(d) {
          return xScale((d.timestamp - tenMinAgo)/1000);
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

function showEvents(events){
  var ul = document.getElementById("events");
  for (i in events){
    var e = events[i]
    var li = document.createElement("li");
    var a = document.createElement('a');
    var linkText = document.createTextNode(e.tabTitle);
    a.appendChild(linkText);
    a.title = e.tabTitle;
    a.href = e.tabUrl;
    li.appendChild(document.createTextNode(e.event + " : "));
    li.appendChild(a);
    ul.appendChild(li);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var tenMinAgo = Date.now() - (1000 * 60 * 10);
  var db = chrome.extension.getBackgroundPage().db;
  db.events.toArray().then(function(events){
    debugger;
    showEvents(events);
  })
  db.emotions.where('timestamp').above(tenMinAgo).toArray().then(function(data){
    graphData(data, tenMinAgo);
  })
});

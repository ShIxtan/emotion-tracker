var emoColors = {
  'happy': 'purple',
  'angry': 'red',
  'sad': 'blue',
  'disgusted': 'green',
  'fear': 'yellow',
  'surprised': 'pink'
}

function graphData(data, oneMinAgo){
  var vis = d3.select("#visualisation"),
    WIDTH = 1000,
    HEIGHT = 500,
    MARGINS = {
        top: 20,
        right: 20,
        bottom: 20,
        left: 50
    },
    xScale = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([0, 60]),
    yScale = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0,1]),
    xAxis = d3.svg.axis().scale(xScale),
    yAxis = d3.svg.axis().scale(yScale).orient("left");

    vis.append("svg:g").attr("class","axis").attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")").call(xAxis);
    vis.append("svg:g").attr("class","axis").attr("transform", "translate(" + (MARGINS.left) + ",0)").call(yAxis);
    for (emotion in emoColors){
      var lineGen = d3.svg.line()
        .x(function(d) {
          return xScale((d.timestamp - oneMinAgo)/1000);
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
  var $ul = $("#events");
  for (i in events){
    var e = events[i]
    var $li = $("<li></li>");
    var $a = $("<a href='" + e.tabUrl + "'>" + e.event + " - " + timeDifference(Date.now(), e.timestamp) + " : " + e.tabTitle + "</a>");
    $a.css("color", emoColors[e.event]);
    $a.addClass("list-group-item");
    $ul.prepend($a);
  }
}

function timeDifference(current, previous) {
  var msPerMinute = 60 * 1000;
  var msPerHour = msPerMinute * 60;
  var msPerDay = msPerHour * 24;
  var msPerMonth = msPerDay * 30;
  var msPerYear = msPerDay * 365;

  var elapsed = current - previous;

  if (elapsed < msPerMinute) {
    return Math.round(elapsed/1000) + ' seconds ago';
  } else if (elapsed < msPerHour) {
    return Math.round(elapsed/msPerMinute) + ' minutes ago';
  } else if (elapsed < msPerDay ) {
    return Math.round(elapsed/msPerHour ) + ' hours ago';
  } else if (elapsed < msPerMonth) {
    return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';
  } else if (elapsed < msPerYear) {
    return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';
  } else {
    return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  var oneMinAgo = Date.now() - (1000 * 60);
  var oneHourAgo = Date.now() - (1000 * 60 * 60);
  var db = chrome.extension.getBackgroundPage().db;
  db.events.where('timestamp').above(oneHourAgo).toArray().then(function(events){
    showEvents(events);
  })
  db.emotions.where('timestamp').above(oneMinAgo).toArray().then(function(data){
    graphData(data, oneMinAgo);
  })
});

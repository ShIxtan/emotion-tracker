function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

function getVid(src){
  var vid = document.getElementById('videoel');
  vid.src = src;

  return vid;
}

function startDrawing(vid, background) {
  var overlay = document.getElementById('overlay');
  var overlayCC = overlay.getContext('2d');

  vid.play();

  loop = setInterval(function(){
    drawLoop(overlayCC, background);
  }, 500);

  return loop;
}

function drawLoop(overlayCC, background) {
  var ctrack = background.ctrack;
  overlayCC.clearRect(0, 0, 400, 300);
  if (ctrack.getCurrentPosition()) {
    ctrack.draw(overlay);
  }

  var currentParams = ctrack.getCurrentParameters();
  var emotions = background.classifier.meanPredict(currentParams);

  if (emotions) {
    str = "";
    for (i in emotions){
      if (emotions[i].emotion){
        str += ("  ---   " + emotions[i].emotion + ": " + Math.floor(emotions[i].value * 100));
      }
    }
    renderStatus(str);
  }

  chrome.storage.local.getBytesInUse(null, function(bytes){
    console.log(bytes);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  var background = chrome.extension.getBackgroundPage()

  var vid = getVid(background.vid.src);

  startDrawing(vid, background);
});

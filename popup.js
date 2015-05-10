function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {

  // *** this code is for video recording ***
  var vid = document.getElementById('videoel');

  // check for camerasupport
  if (navigator.webkitGetUserMedia) {
    // set up stream

    var videoSelector = {video : true};

    navigator.webkitGetUserMedia(videoSelector, function( stream ) {
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
      vid.play();
    }, function() {
      chrome.runtime.openOptionsPage();
      alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
    });
  } else {
    alert("This extension depends on getUserMedia, which your browser does not seem to support. :(");
  }

  /*********** setup of emotion detection *************/

  var ctrack = new clm.tracker({useWebGL : true});
  ctrack.init(pModel);
  var ec = new emotionClassifier();
  ec.init(emotionModel);
  var overlay = document.getElementById('overlay');
  var overlayCC = overlay.getContext('2d');

  function startDrawing() {
    vid.play();
    ctrack.start(vid);
    loop = setInterval(drawLoop.bind(this), 500);

    return loop;
  }

  function drawLoop() {
    overlayCC.clearRect(0, 0, 400, 300);
    if (ctrack.getCurrentPosition()) {
      ctrack.draw(overlay);
    }
    var cp = ctrack.getCurrentParameters();

    var er = ec.meanPredict(cp);
    if (er) {
      str = "";
      for (i in er){
        str += ("  ---   " + er[i].emotion + ": " + Math.floor(er[i].value * 100));
      }
      renderStatus(str);
    }
  }

  startDrawing();
});

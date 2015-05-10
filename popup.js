/**
 * Get the current tab.
 *
 * @param {function(tab)} callback - called when the current tab is found.
 **/
function getCurrentTab(callback) {
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];

    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(tab);
  });
}

function renderStatus(statusText) {
  document.getElementById('status').textContent = statusText;
}

document.addEventListener('DOMContentLoaded', function() {
  getCurrentTab(function(tab) {
    renderStatus('currently on: ' + tab.title);
  });

  // *** this code is for video recording ***
  var vid = document.getElementById('videoel');
  var overlay = document.getElementById('overlay');
	var overlayCC = overlay.getContext('2d');

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
  var emotionData = ec.getBlank();

  function startTracking() {
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

      getCurrentTab(function(tab){
        er.tabTitle = tab.title;
        er.tabUrl = tab.url;
        var time = Date.now()
        params = {};
        params[time] = er;
        chrome.storage.local.set(params);
      });
    }

    chrome.storage.local.getBytesInUse(null, function(bytes){
      console.log(bytes);
    })

  }

  startTracking();
});

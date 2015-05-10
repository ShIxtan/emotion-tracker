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
  var emotionData = ec.getBlank();

  function startTracking() {
    vid.play();
    ctrack.start(vid);
    loop = setInterval(trackLoop.bind(this), 500);

    return loop;
  }

  function drawLoop() {
    var cp = ctrack.getCurrentParameters();

    var er = ec.meanPredict(cp);
    if (er) {
      getCurrentTab(function(tab){
        er.tabTitle = tab.title;
        er.tabUrl = tab.url;
        var time = Date.now()
        params = {};
        params[time] = er;
        chrome.storage.local.set(params);
      });
    }
  }

  startTracking();
});

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
    if (tab) {
      var url = tab.url;

      console.assert(typeof url == 'string', 'tab.url should be a string');

      callback(tab);
    }
  });
}

function getVid(successCallback){
  // check for camerasupport
  if (navigator.webkitGetUserMedia) {
    // set up stream

    var videoSelector = {video : true};

    navigator.webkitGetUserMedia(videoSelector, function( stream ) {
      var vid = document.getElementById('videoel');
      vid.src = (window.URL && window.URL.createObjectURL(stream)) || stream;
      vid.onloadedmetadata = function() {
        vid.play();
        successCallback(vid);
      };
    }, function() {
      chrome.runtime.openOptionsPage();
      alert("There was some problem trying to fetch video from your webcam. If you have a webcam, please make sure to accept when the browser asks for access to your webcam.");
    });
  } else {
    alert("This extension depends on getUserMedia, which your browser does not seem to support. :(");
  }
}

function saveEmotions(emotions){
  getCurrentTab(function(tab){
    emotions.tabTitle = tab.title;
    emotions.tabUrl = tab.url;
    var params = {};
    params[Date.now()] = emotions;
    chrome.storage.local.set(params);
  });
}

function startTracking(vid) {
  var ctrack = new clm.tracker({useWebGL : true});
  ctrack.init(pModel);
  var classifier = new emotionClassifier();
  classifier.init(emotionModel);

  ctrack.start(vid);
  setInterval(function(){
    trackLoop(ctrack, classifier);
  }, 500);
}

function trackLoop(ctrack, classifier) {
  var currentParams = ctrack.getCurrentParameters();
  var emotions = classifier.meanPredict(currentParams);

  if (emotions) {
    var max = 0.5;
    var emotion = "bored";
    for (i in emotions){
      if (emotions[i].value > max){
        max = emotions[i].value;
        emotion = emotions[i].emotion
      }
    }

    chrome.browserAction.setIcon({path:"img/" + emotion + ".png"});

    saveEmotions(emotions);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  getVid(startTracking);
});
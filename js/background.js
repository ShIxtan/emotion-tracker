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

function openDB(){
  var db = new Dexie("emotions-database");
  db.version(1).stores({
    emotions: "timestamp,tabUrl,tabTitle"
  })

  db.open();

  Dexie.Promise.on('error', function(err) {
    console.log("Uncaught error: " + err);
  });

  return db;
}

function getVid(successCallback){
  // check for camerasupport
  if (navigator.webkitGetUserMedia) {
    // set up stream
    var vid = document.getElementById('videoel');
    var videoSelector = {video : true};

    navigator.webkitGetUserMedia(videoSelector, function( stream ) {

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

  return vid;
}

function saveEmotions(emotions){
  getCurrentTab(function(tab){
    var data = {};
    for (i in emotions){
      data[emotions[i].emotion] = emotions[i].value;
    }
    data.tabTitle = tab.title;
    data.tabUrl = tab.url;
    data.timestamp = Date.now();
    
    if (db){
      db.emotions.put(data)
    } else {
      var params = {};
      params[Date.now()] = data;
      chrome.storage.local.set(params);
    }
  });
}

function startTracking(vid) {
  ctrack = window.ctrack = new clm.tracker({useWebGL : true});
  ctrack.init(pModel);
  var classifier = window.classifier = new emotionClassifier();
  classifier.init(emotionModel);

  ctrack.start(vid);
  trackLoop(ctrack, classifier)
}

function trackLoop(ctrack, classifier) {
  setTimeout(function(){
    trackLoop(ctrack, classifier);
  }, 500);
  var currentParams = ctrack.getCurrentParameters();
  var emotions = classifier.meanPredict(currentParams);

  if (emotions) {
    var max = 0.4;
    emotion = "bored";
    for (i in emotions){
      if (emotions[i].value > max){
        max = emotions[i].value;
        var emotion = emotions[i].emotion
      }
    }
    if (emotion){
      chrome.browserAction.setIcon({path:"img/" + emotion + ".png"});
    }

    saveEmotions(emotions);
  }
}

document.addEventListener('DOMContentLoaded', function() {
  window.db = openDB();
  window.vid = getVid(startTracking);
});

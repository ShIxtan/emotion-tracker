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
  var db = new Dexie("database");
  db.version(1).stores({
    emotions: "timestamp,tabUrl,tabTitle"
  })
  db.version(2).stores({
    emotions: "timestamp,tabUrl,tabTitle",
    events: "timestamp,tabUrl,tabTitle,event"
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

function saveEvent(emotion){
  getCurrentTab(function(tab){
    var data = {
      'tabTitle': tab.title,
      'tabUrl': tab.url,
      'timestamp': Date.now(),
      'event': emotion
    };
    db.events.put(data);
  });
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

    db.emotions.put(data)
  });
}

function startTracking(vid) {
  ctrack = window.ctrack = new clm.tracker({useWebGL : true});
  ctrack.init(pModel);
  var classifier = window.classifier = new emotionClassifier();
  classifier.init(emotionModel);

  ctrack.start(vid);
  trackLoop(ctrack, classifier, {}, 60)
}

function trackLoop(ctrack, classifier, recentEvents, count) {
  var score = ctrack.getScore();
  if (score > 0.6){
    var currentParams = ctrack.getCurrentParameters();
    var emotions = classifier.meanPredict(currentParams);

    if (emotions) {
      var max = 0.8;
      var emotion = "bored";

      for (i in emotions){
        var emo = emotions[i];

        if (emo.value > max){
          max = emo.value;
          var emotion = emo.emotion;
        }

        if ((emo.value > 0.9) && (!recentEvents[emo.emotion])){
          recentEvents[emo.emotion] = true;
          saveEvent(emo.emotion);
        } else if (emo.value < 0.2) {
          recentEvents[emo.emotion] = false;
        }
      }

      chrome.browserAction.setIcon({path:"img/" + emotion + ".png"});
    }
  } else {
    chrome.browserAction.setIcon({path:"img/bad.png"});
  }

  if ((count >= 60) && emotions){
    saveEmotions(emotions);
    count = 0;
  } else {
    count++;
  }
  setTimeout(function(){
    trackLoop(ctrack, classifier, recentEvents, count);
  }, 1000/60);
}

document.addEventListener('DOMContentLoaded', function() {
  window.db = openDB();
  window.vid = getVid(startTracking);
});

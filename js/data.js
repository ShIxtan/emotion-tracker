document.addEventListener('DOMContentLoaded', function() {
  var db = chrome.extension.getBackgroundPage().db;
  data = db.emotions.toArray();
  debugger;
});

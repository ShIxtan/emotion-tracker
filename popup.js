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
});

// popup.js

function sendMessageToContentScript(searchTerm1, searchTerm2) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'executeContentScript', searchTerm1, searchTerm2 });
    });
}

function fetchWords() {
    var searchTerm1 = $('.input1 input').val();
    var searchTerm2 = $('.input2 input').val();

    sendMessageToContentScript(searchTerm1, searchTerm2);
}

$('.contextSearchSubmit').click(fetchWords);
  
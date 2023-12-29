// popup.js
// const currIndex = 0;

function sendMessageToContentScript(searchTerm1, searchTerm2) {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'executeContentScript', searchTerm1, searchTerm2 });
    });
}

function fetchWords() {
    var searchTerm1 = $('.input1 input').val();
    var searchTerm2 = $('.input2 input').val();

    if(searchTerm1 && searchTerm2) removeDisabled();
    sendMessageToContentScript(searchTerm1, searchTerm2);
}

function next() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'next'});
  });
}
function prev() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'prev'});
  });
}

function removeDisabled() {
  $('.contextSearchNext').removeClass('disabled');
  $('.contextSearchPrev').removeClass('disabled');
}
function addDisabled() {
  $('.contextSearchNext').addClass('disabled');
  $('.contextSearchPrev').addClass('disabled');
}



$('.contextSearchSubmit').click(fetchWords);
$(".input1 input, .input2 input").keydown(function (e) {
  if (e.keyCode == 13) {
    fetchWords();
  }
});

$('.contextSearchNext').click(next);
$('.contextSearchPrev').click(prev);
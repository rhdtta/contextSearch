// content.js
// utility functions
function highlightSearchText(searchTerm1, searchTerm2, withSyntax) {
    var regex1 = new RegExp(searchTerm1, "gi");
    var regex2 = new RegExp(searchTerm2, "gi");
    var index1 = 0;
    var highlightText = withSyntax.replace(regex1, function(match) {
        return '<span class="highlights_1_' + index1++ + '">' + match + '</span>';
    })

    var index2 = 0;
    var highlightText = highlightText.replace(regex2, function(match) {
        return '<span class="highlights_2_' + index2++ + '">' + match + '</span>';
    })

    $('body').html(highlightText);


    var style = document.createElement("style");
    style.innerHTML = 'span[class^="highlights_1_"] { background-color: yellow;} span[class^="highlights_2_"] { background-color: green;}';

    document.head.appendChild(style);

    return highlightText;
}

function findAllRegexIndices(inputString, regex) {
    let indices = [];
    let match;

    // Loop through all matches using exec
    while ((match = regex.exec(inputString)) !== null) {
        indices.push(match.index);
    }

    return indices;
}

function nearbyMatchPairs(indexes1, indexes2, threshold) {
    let matchPairs = [];

    // now we find the combinations that are nearby
    if(!indexes1.length || !indexes2.length) {
        return matchPairs;
    }
    for (let i=0; i < indexes1.length; i++) {
        for(let j=0; j<indexes2.length; j++) {
            if(Math.abs(indexes1[i]-indexes2[j]) < threshold) {
                matchPairs.push({
                    "word1": "highlights_1_" + i,
                    "word2": "highlights_2_" + j,
                })
            }
        }
    }

    return matchPairs;
}

function manipulateDOM(searchTerm1, searchTerm2) {
    console.log('Content script is running on the webpage!');
    var onlyText = $('body').text();
    var withSyntax = $('body').html();
    // var searchTerm1 = "julius";
    // var searchTerm2 = "brutus";

    // first, we add the highlights on all the ocassions of both the texts
    var highlightedText = highlightSearchText(searchTerm1, searchTerm2, withSyntax);

    // second, we calculate the distance and store in array
    var indexes1 = findAllRegexIndices(onlyText, new RegExp(searchTerm1, "gi"));
    var indexes2 = findAllRegexIndices(onlyText, new RegExp(searchTerm2, "gi"));

    // now we find the combinations that are nearby
    console.log(nearbyMatchPairs(indexes1, indexes2, 100));
}
    
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'executeContentScript') {
      manipulateDOM(request.searchTerm1, request.searchTerm2);
    }
});
  
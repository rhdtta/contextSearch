const HIGHLIGHT_NAME = 'match';

function mapNodes(container) {
    // function to explore all the nodes in the DOM and put it in an array
    const nodes = textNodes(container);
    // console.log('len', nodes.length)
    // console.log(nodes.filter((n, i) => i < 20).map(n => "|" + n.nodeValue + "|").join('\n'));
    let c = 0;
    return nodes.map((node, i) => {
        let text = node.nodeValue;
        if (!node.parentElement.closest('pre')) {
            text = node.nodeValue.replace(/\n+ +/g, ' ');
            node.nodeValue = text;
        }
 
        let start = c;
        c += text.length;
        let end = c;
        return {
            start, end, text, node
        }
    });
}

function textNodes(parent) {
    // converting all the nodes to just text nodes
    return [...parent.childNodes].flatMap(node => {
        switch (node.nodeType) {
            case Node.TEXT_NODE:
                return node;
            case Node.ELEMENT_NODE:
                return textNodes(node);
            default:
                console.log(node.type, node.nodeValue)
                parent.removeChild(node);
        }
    }).filter(n => n);
}

function escape(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}


class HighlightingElement {

    constructor(container, hideMismatches) {
        this.nodes = mapNodes(container);
        this.text = container.textContent;
        this.container = container;
        this.hidableElements = [...container.children];
        this.hideMismatches = hideMismatches;
        // console.log(this.text.substr(0, 100));
        // console.log(this.nodes.map(n => n.text).join('').substr(0, 100));
    }

    findHidableParentIndex(el) {
        while (el.parentElement !== this.container) {
            el = el.parentElement;
        }
        return this.hidableElements.indexOf(el)
    }

    hideNotMatchingElements(ranges) {

        this.hidableElements.forEach(el => el.style.display = 'none');

        ranges.forEach(r => {
            const start = this.findHidableParentIndex(r.startContainer);
            const end = this.findHidableParentIndex(r.endContainer);
            for (let i = start; i <= end; i++) {
                this.hidableElements[i].style.display = '';
            }
        });
    }

    getBoundaryPoint(pos) {
        // debugger;
        const node = this.nodes.find(n => n.start <= pos && n.end > pos);
        const offset = pos - node.start;
        return [node.node, offset];
    }

    highlight(str) {
        if (!str) {
            this.hidableElements.forEach(el => el.style.display = '');
            return CSS.highlights.delete(HIGHLIGHT_NAME);
        }

        const matches = [...this.text.matchAll(new RegExp(escape(str), 'ig'))];

        const ranges = matches.map(match => {

            const start = match.index;
            const end = start + match[0].length;

            const [startContainer, startOffset] = this.getBoundaryPoint(start);
            const [endContainer, endOffset] = this.getBoundaryPoint(end);

            return new StaticRange({ startContainer, startOffset, endContainer, endOffset });
        });
        // debugger;
        console.log(ranges);

        if (this.hideMismatches) this.hideNotMatchingElements(ranges);
        CSS.highlights.set(HIGHLIGHT_NAME, new Highlight(...ranges));
    }
}

// import here ends


// utility functions
// function highlightSearchText(searchTerm1, searchTerm2, withSyntax) {
//     var regex1 = new RegExp(searchTerm1, "gi");
//     var regex2 = new RegExp(searchTerm2, "gi");
//     var index1 = 0;
//     var highlightText = withSyntax.replace(regex1, function(match) {
//         return '<span class="highlights_1_' + index1++ + '">' + match + '</span>';
//     })

//     var index2 = 0;
//     var highlightText = highlightText.replace(regex2, function(match) {
//         return '<span class="highlights_2_' + index2++ + '">' + match + '</span>';
//     })

//     $('body').html(highlightText);


//     var style = document.createElement("style");
//     style.innerHTML = 'span[class^="highlights_1_"] { background-color: yellow;} span[class^="highlights_2_"] { background-color: green;}';

//     document.head.appendChild(style);

//     return highlightText;
// }

// function findAllRegexIndices(inputString, regex) {
//     let indices = [];
//     let match;

//     // Loop through all matches using exec
//     while ((match = regex.exec(inputString)) !== null) {
//         indices.push(match.index);
//     }

//     return indices;
// }

// function nearbyMatchPairs(indexes1, indexes2, threshold) {
//     let matchPairs = [];

//     // now we find the combinations that are nearby
//     if(!indexes1.length || !indexes2.length) {
//         return matchPairs;
//     }
//     for (let i=0; i < indexes1.length; i++) {
//         for(let j=0; j<indexes2.length; j++) {
//             if(Math.abs(indexes1[i]-indexes2[j]) < threshold) {
//                 matchPairs.push({
//                     "word1": "highlights_1_" + i,
//                     "word2": "highlights_2_" + j,
//                 })
//             }
//         }
//     }

//     return matchPairs;
// }
console.log(document.getElementsByTagName('body')[0]) 

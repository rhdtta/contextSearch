////////////////////////////
//  Utility functions starts

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
                // console.log(node.type, node.nodeValue)
                parent.removeChild(node);
        }
    }).filter(n => n);
}

function escape(str) {
    return str.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
//  Utility functions ends
//////////////////////////

const HIGHLIGHT_NAME = "match";


class HighlightingElement {
    constructor(container, hideMismatches, highlight_color) {
        this.nodes = mapNodes(container);
        this.text = container.textContent;
        this.container = container;
        this.hidableElements = [...container.children];
        this.hideMismatches = hideMismatches;
        this.HIGHLIGHT_NAME = highlight_color
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
        var ranger = [];
        if (!str) {
            this.hidableElements.forEach(el => el.style.display = '');
            return CSS.highlights.delete(this.HIGHLIGHT_NAME);
        }

        const matches = [...this.text.matchAll(new RegExp(escape(str), 'ig'))];

        const ranges = matches.map(match => {

            const start = match.index;
            const end = start + match[0].length;

            const [startContainer, startOffset] = this.getBoundaryPoint(start);
            const [endContainer, endOffset] = this.getBoundaryPoint(end);

            ranger.push({startContainer, start});
            return new StaticRange({ startContainer, startOffset, endContainer, endOffset });
        });

        if (this.hideMismatches) this.hideNotMatchingElements(ranges);
        CSS.highlights.set(this.HIGHLIGHT_NAME, new Highlight(...ranges));

        return ranger;
    }
}

var indexValue, ranges;
const highlightingElement1 = new HighlightingElement(document.getElementsByTagName('body')[0], false, "match1");
const highlightingElement2 = new HighlightingElement(document.getElementsByTagName('body')[0], false, "match2");

function highlightDOM(searchTerm1, searchTerm2) {
    if(searchTerm1) {
        var matches1 = highlightingElement1.highlight(searchTerm1);
    }
    if(searchTerm2) {
        var matches2 = highlightingElement2.highlight(searchTerm2);
    }

    return [matches1, matches2];
}

function scrollTo(index) {
    index.startContainer.parentElement.scrollIntoView(true);
}

function nearbyMatchPairs(range1, range2, threshold) {
    let matchPairs = [];
    // console.log('rangeeee', range1, range2)
    
    // now we find the combinations that are nearby
    if(!range1.length || !range2.length) {
        return matchPairs;
    }
    var count = 0;
    for (let i=0; i < range1.length; i++) {
        for(let j=0; j<range2.length; j++) {
            if(Math.abs(range1[i].start-range2[j].start) < threshold) {
                // console.log('hhhello' ,range1[i].start, range2[j].start)
                // console.log('diff', Math.abs(range1[i].start-range2[j].start))
                matchPairs.push(range1[i])
                // if(!matchPairs.length) {
                // } else if(matchPairs[matchPairs.length - 1].startOffset != range1[i].startOffset) {
                //     matchPairs.push(range1[i])
                // }
            }
        }
    }
    // console.log(count)

    // console.log(matchPairs.length, range1.length, range2.length)

    return matchPairs;
}
    
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'executeContentScript') {
        var ranges1, ranges2;
        [ranges1, ranges2] = highlightDOM(request.searchTerm1, request.searchTerm2);
        // console.log('hey', ranges1, ranges2)
        console.log('sss', ranges1, ranges2)
        ranges = nearbyMatchPairs(ranges1, ranges2, 100);
        console.log('rrr', ranges)
        indexValue = 0;
    }
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'next') {
        if(indexValue == ranges.length-1) {
            indexValue = -1;
        }
        scrollTo(ranges[++indexValue]);
    }
});
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'prev') {
        if(indexValue == 0) {
            indexValue = ranges.length;
        }
        scrollTo(ranges[--indexValue]);
    }
});
  
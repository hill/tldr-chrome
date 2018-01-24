
//https://api.github.com/repos/tldr-pages/tldr/contents/pages/common
let tldrURL = "https://raw.githubusercontent.com/tldr-pages/tldr/master/pages";
var tooltip = null;
var arrow = null;
var currentContent = null;
console.log(currentContent);

// For right-click tldr search
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.word);
    searchTLDR(request.word.toLowerCase());
  }
);

function searchTLDR(command, platform) {
  platform = platform || "common";

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", reqListener);
  xhr.open(
    "GET",
    tldrURL + '/' + platform + '/' + command + '.md'
  );
  xhr.send();

  function reqListener(){
    createTooltip(this.responseText);
  }

}

function createTooltip(content, isMarked) {
  isMarked = isMarked || false
  var selection = window.getSelection(),
      range = selection.getRangeAt(0),
      rect = range.getBoundingClientRect();



  if (rect.width >= 0) {

    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip);
    }

    tooltip = document.createElement('div');
    tooltip.id = "tldr-chrome";
    newtop = rect.top - 200 + window.scrollY;

    Object.assign(
      tooltip.style,
      {
        top: newtop + 'px',
        left: rect.left + 'px',

      }
    );

    document.body.appendChild(tooltip);

    // Create Arrow

    arrow = document.createElement('div');
    arrow.id = "tldr-chrome-arrow";
    document.body.appendChild(arrow);

    Object.assign(
      arrow.style,
      {
        left: (rect.left) + 5 +'px',
        top: newtop + 195 + 'px' // newtop + height of tooltip
      }
    );

    // Create markdown and append to tooltip
    if (content.trim() === "404: Not Found") {
      var markdown = "<div class='not-found'><p class='large'>😱</p><p>Page Not Found!</p><p>Submit a pull request to: <a target='_blank' href='https://github.com/tldr-pages/tldr'>https://github.com/tldr-pages/tldr</a></p></div>";
    } else if (isMarked) {
      var markdown = content;
    } else {
      var markdown = marked(content);
    }

    currentContent = markdown;

    var markdownContent = document.createElement('div');
    markdownContent.innerHTML = markdown;
    markdownContent.className += 'tldr-chrome';
    tooltip.appendChild(markdownContent);
  }

}

function removeTooltip() {
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip);
    tooltip = null;
    arrow.parentNode.removeChild(arrow);
    arrow = null;
    currentContent = null;
  }
}

window.onmousedown = removeTooltip;

var commandList = [];

function generateCommandList(callback) {
  commandList = [];
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", reqListener);
  xhr.open(
    "GET",
    "https://api.github.com/repos/tldr-pages/tldr/contents/pages/common"
  );
  xhr.send();

  function reqListener(){
    var arr = JSON.parse( this.responseText );

    for (doc of arr) {
      commandList.push(doc.name.split('.')[0]);
    }

    callback();

  }

}

function checkCode() {
  generateCommandList(function(){
    var preTags = document.getElementsByTagName('pre');
    for (tag of preTags) {
      for (word of tag.innerText.split(" ")) {
        if (commandList.indexOf(word.toLowerCase()) > -1) {
          // if word is in commandList
          console.log("FOUND COMMAND: " + word);
        }
      }
    }
  })
}

window.onresize = function(event) {
  if (tooltip) {
    oldContent = currentContent;
    removeTooltip();
    createTooltip(oldContent, true);
  }
};

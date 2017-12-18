/*
TODO

[x] search for word in github
[x] load relavent markdown
[ ] display markdown in tooltip
[ ] make tool tip stay in place on scroll
[ ] flip tooltip based on where the element is on the page
[ ] search for keywords in pre and code tags
    - display underline
    - allow click and open tooltip
[ ] comment current codebase

*/

//https://api.github.com/repos/tldr-pages/tldr/contents/pages/common

let tldrURL = "https://raw.githubusercontent.com/tldr-pages/tldr/master/pages"

// For right-click tldr search
chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.word)
    searchTLDR(request.word.toLowerCase())
  }
);

function searchTLDR(command, platform) {
  platform = platform || "common";

  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", reqListener);
  xhr.open(
    "GET",
    tldrURL + '/' + platform + '/' + command + '.md'
  )
  xhr.send()

  function reqListener(){
    createTooltip(this.responseText)
  }
}


var div = null
var tooltip = null

function createTooltip(content) {
  // https://stackoverflow.com/questions/18302683/how-to-create-tooltip-over-text-selection-without-wrapping/18302723#18302723
  var selection = window.getSelection(),
      range = selection.getRangeAt(0),
      rect = range.getBoundingClientRect();

  if (rect.width >= 0) {

  //   if (div) {
  //     div.parentNode.removeChild(div)
  //   }
  //
  //   div = document.createElement('div') // create the box
  //   div.class = 'rect'
  //   div.style.border = '2px solid black' // create outline
  //   div.style.position = 'fixed'
  //   div.style.top = rect.top + 'px'
  //   div.style.left = rect.left + 'px'
  //   div.style.height = rect.height + 'px'
  //   div.style.width = rect.width + 'px'
  //   document.body.appendChild(div) // append to document
  // }

    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip)
    }

    tooltip = document.createElement('tooltip')
    Object.assign(
      tooltip.style,
      {
        background: "#4A4A4A",
        boxShadow: "0 2px 4px 0 rgba(0,0,0,0.50)",
        borderRadius: "8px",
        transition: '.2s',
        position: "absolute",

      }
    )

    newtop = rect.top - 200 + window.scrollY
    tooltip.style.top = newtop + 'px'
    tooltip.style.left = rect.left + 'px'
    tooltip.style.height = '195px'
    tooltip.style.width = '300px'
    document.body.appendChild(tooltip)

  }

}

function removeTooltip() {
  if (tooltip) {
    tooltip.parentNode.removeChild(tooltip)
  }
}

window.onmousedown = removeTooltip

var commandList = []

function generateCommandList(callback) {
  commandList = []
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("load", reqListener);
  xhr.open(
    "GET",
    "https://api.github.com/repos/tldr-pages/tldr/contents/pages/common"
  )
  xhr.send()

  function reqListener(){
    var arr = JSON.parse( this.responseText )

    for (doc of arr) {
      commandList.push(doc.name.split('.')[0])
    }

    callback()

  }

}

function checkCode() {
  generateCommandList(function(){
    var preTags = document.getElementsByTagName('pre')
    for (tag of preTags) {
      for (word of tag.innerText.split(" ")) {
        if (commandList.indexOf(word.toLowerCase()) > -1) {
          // if word is in commandList
          console.log("FOUND COMMAND: " + word)
        }
      }
    }
  })
}

checkCode()

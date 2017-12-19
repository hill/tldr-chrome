
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

document.createElement("style").innerText += ".TDLRmarkdown h1 {font-family: monospace; font-size: 40px; color: white; } \n .TDLRmarkdown code {background: white;}"
var tooltip = null
var arrow = null

function createTooltip(content) {
  // https://stackoverflow.com/questions/18302683/how-to-create-tooltip-over-text-selection-without-wrapping/18302723#18302723
  var selection = window.getSelection(),
      range = selection.getRangeAt(0),
      rect = range.getBoundingClientRect();

  if (rect.width >= 0) {

    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip)
    }

    tooltip = document.createElement('div')
    Object.assign(
      tooltip.style,
      {
        background: "#4A4A4A",
        boxShadow: "0 2px 4px 0 rgba(0,0,0,0.50)",
        borderRadius: "8px",
        transition: '.2s',
        position: "absolute",
        overflow: "scroll"

      }
    )

    newtop = rect.top - 200 + window.scrollY
    tooltip.style.top = newtop + 'px'
    tooltip.style.left = rect.left + 'px'
    tooltip.style.height = '195px'
    tooltip.style.width = '500px'

    document.body.appendChild(tooltip)

    // Create Arrow

    arrow = document.createElement('div')
    document.body.appendChild(arrow)

    Object.assign(
      arrow.style,
      {
        width: "0",
        height: "0",
        borderLeft: "10px solid transparent",
        borderRight: "10px solid transparent",
        borderTop: "10px solid #4A4A4A",
        position: "absolute",
        left: (rect.left) + 5 +'px',
        top: newtop + 195 + 'px' // newtop + height of tooltip
      }
    )

    // Create markdown and append to tooltip
    if (content.trim() === "404: Not Found") {
      console.log('content!')
      var markdown = "<center><p style='font-size:50px;padding:0; padding-top: 30px; margin:0;'>😱</p><p>Page Not Found!</p><p>Submit a pull request to: <a target='_blank' href='https://github.com/tldr-pages/tldr'>https://github.com/tldr-pages/tldr</a></p>"
    } else {
      console.log('markdown!')
      var markdown = marked(content)
    }

    var markdownContent = document.createElement('div')
    markdownContent.innerHTML = markdown
    markdownContent.className += 'TLDRmarkdown'
    tooltip.appendChild(markdownContent)

    Object.assign(
      markdownContent.style,
      {
        color: "white",
        padding: "10px"
      }
    )

    //markdownContent.getElementsByTagName('h1')

  }

}

function removeTooltip() {
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip)
    tooltip = null
    arrow.parentNode.removeChild(arrow)
    arrow = null
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

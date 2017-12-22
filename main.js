
//https://api.github.com/repos/tldr-pages/tldr/contents/pages/common
let tldrURL = "https://raw.githubusercontent.com/tldr-pages/tldr/master/pages"
let fontURLBold = chrome.runtime.getURL('/fonts/OfficeCodePro-Bold.woff'),
    fontURLMedium = chrome.runtime.getURL('/fonts/OfficeCodePro-Medium.woff'),
    fontURLMediumItalic = chrome.runtime.getURL('/fonts/OfficeCodePro-MediumItalic.woff')

document.createElement("style").innerText += ".TDLRmarkdown h1 {font-family: monospace; font-size: 40px; color: white; }\
                                              .TDLRmarkdown code {background: white;}\
                                              @font-face { font-family: 'Office Code Pro'; src:  url('" + fontURLMedium + "') format('woff');}\
                                              @font-face { font-family: 'Office Code Pro'; src:  url('" + fontURLBold + "') format('woff'); font-weight: 900;}\
                                              @font-face { font-family: 'Office Code Pro'; src:  url('" + fontURLMediumItalic + "') format('woff'); font-style: italic}"
var tooltip = null
var arrow = null
var currentContent = null
console.log(currentContent)

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

function createTooltip(content, isMarked) {
  isMarked = isMarked || false
  var selection = window.getSelection(),
      range = selection.getRangeAt(0),
      rect = range.getBoundingClientRect();



  if (rect.width >= 0) {

    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip)
    }

    tooltip = document.createElement('div')
    tooltip.id = "TLDRtooltip"
    newtop = rect.top - 200 + window.scrollY

    Object.assign(
      tooltip.style,
      {
        background: "#4A4A4A",
        boxShadow: "0 2px 4px 0 rgba(0,0,0,0.50)",
        borderRadius: "8px",
        transition: '.2s',
        position: "absolute",
        overflow: "scroll",
        top: newtop + 'px',
        left: rect.left + 'px',
        height: '195px',
        width: '500px'

      }
    )

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
      var markdown = "<center><p style='font-size:50px;padding:0; padding-top: 30px; margin:0;'>😱</p><p>Page Not Found!</p><p>Submit a pull request to: <a target='_blank' href='https://github.com/tldr-pages/tldr'>https://github.com/tldr-pages/tldr</a></p>"
    } else if (isMarked) {
      var markdown = content
    } else {
      var markdown = marked(content)
    }

    currentContent = markdown;

    var markdownContent = document.createElement('div')
    markdownContent.innerHTML = markdown
    markdownContent.className += 'TLDRmarkdown'
    tooltip.appendChild(markdownContent)

    fontface = document.createElement('style')
    document.head.appendChild(fontface)
    fontface.innerText += "@font-face { font-family: 'Office Code Pro'; src:  url('" + fontURLMedium + "') format('woff');}\
    @font-face { font-family: 'Office Code Pro'; src:  url('" + fontURLBold + "') format('woff'); font-weight: 900;}\
    @font-face { font-family: 'Office Code Pro'; src:  url('" + fontURLMediumItalic + "') format('woff'); font-style: italic}\
    "

    Object.assign(
      markdownContent.style,
      {
        color: "white",
        padding: "10px"
      }
    )

    Object.assign(
      markdownContent.getElementsByTagName('h1')[0].style,
      {
        fontSize: '30px',
        fontFamily: 'Office Code Pro',
        color: 'white'
      }
    )

    Object.assign(
      markdownContent.getElementsByTagName('blockquote')[0].style,
      {
        fontSize: '15px',
        fontFamily: 'Office Code Pro',
        fontStyle: 'italic',
        color: 'white'
      }
    )

    for (i of markdownContent.getElementsByTagName('p')) {
      Object.assign(
        i.style,
        {
          fontSize: '15px',
          fontFamily: 'Office Code Pro',
          color: 'white'
        }
      )
    }
    for (i of markdownContent.getElementsByTagName('li')) {
      Object.assign(
        i.style,
        {
          fontSize: '14px',
          fontFamily: 'Office Code Pro',
          color: 'white',
          listStyleType: 'none'

        }
      )
    }
    for (i of markdownContent.getElementsByTagName('ul')) {
      Object.assign(
        i.style,
        {
          marginLeft: '0',
          paddingLeft: '0',
        }
      )
    }
    for (i of markdownContent.getElementsByTagName('code')) {
      Object.assign(
        i.style,
        {
          background: 'white',
          borderRadius: '2px',
          boxShadow: '0 1px 2px 0 rgba(0,0,0,0.50)',
          color: '#4A4A4A'
        }
      )
    }

  }

}

function removeTooltip() {
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip)
    tooltip = null
    arrow.parentNode.removeChild(arrow)
    arrow = null
    currentContent = null
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

window.onresize = function(event) {
  if (tooltip) {
    oldContent = currentContent
    removeTooltip()
    createTooltip(oldContent, true)
  }
}

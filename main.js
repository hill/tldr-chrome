// Define constants
const apiContentURL = 'https://api.github.com/repos/tldr-pages/tldr/contents/pages/common'
const tldrURL = 'https://raw.githubusercontent.com/tldr-pages/tldr/master/pages'

let tooltip = null
let arrow = null
let currentContent = null


// For right-click tldr search
chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log(request.word)
    searchTLDR(request.word.toLowerCase())
    checkCode()
  }
)

function searchTLDR (command, platform = 'common') {
  // Fetch the content from TLDR github repo
  fetch(`${tldrURL}/${platform}/${command}.md`)
    .then((response) => {
      return response.text()
    })
    .then(data => {
      createTooltip(data)
    })
}

function createTooltip (content, isMarked = false) {
  let selection = window.getSelection()
  let range = selection.getRangeAt(0)
  let rect = range.getBoundingClientRect()
  let newtop = null

  if (rect.width >= 0) {

    if (tooltip) {
      tooltip.parentNode.removeChild(tooltip)
    }

    tooltip = document.createElement('div')
    tooltip.id = 'tldr-chrome'
    newtop = rect.top - 200 + window.scrollY

    Object.assign(
      tooltip.style,
      {
        top: `${newtop}px`,
        left: `${rect.left}px`
      }
    )

    document.body.appendChild(tooltip)

    // Create Arrow
    arrow = document.createElement('div')
    arrow.id = 'tldr-chrome-arrow'
    document.body.appendChild(arrow)

    Object.assign(
      arrow.style,
      {
        left: `${(rect.left) + 5}px`,
        top: `${newtop + 195}px` // newtop + height of tooltip
      }
    )

    // Create markdown and append to tooltip
    let markdown = null
    if (content.trim() === '404: Not Found') {
      markdown = '<div class="not-found"><p class="large">😱</p><p>Page Not Found!</p><p>Submit a pull request to: <a target="_blank" href="https://github.com/tldr-pages/tldr">https://github.com/tldr-pages/tldr</a></p></div>'
    } else {
      if (isMarked) {
        markdown = content
      } else {
        markdown = marked(content)
      }
    }

    currentContent = markdown

    let markdownContent = document.createElement('div')
    markdownContent.innerHTML = markdown
    markdownContent.className += 'tldr-chrome'
    tooltip.appendChild(markdownContent)
  }
}

// removes the tooltip, arrow and content
function removeTooltip () {
  if (tooltip != null) {
    tooltip.parentNode.removeChild(tooltip)
    tooltip = null
    arrow.parentNode.removeChild(arrow)
    arrow = null
    currentContent = null
  }
}

// Ensures the tldr tooltip does not close if clicked on
window.onmousedown = (mouseDownEvent) => {
  let isPopup = false
  mouseDownEvent.path.forEach((elementInPath) => {
    if (elementInPath.id === 'tldr-chrome') isPopup = true
  })

  if (!isPopup) {
    removeTooltip()
  }
}

let commandList = []

// Creates a list of all commands available in the TLDR repo
function generateCommandList (callback) {
  commandList = []

  fetch(apiContentURL)
    .then((response) => {
      return response.json()
    })
    .then(data => {
      let doc
      for (doc of data) {
        commandList.push(doc.name.split('.')[0])
      }

      callback()
    })
}

// Checks if a command in pre tags is available in the TLDR github repo
function checkCode () {
  generateCommandList(() => {
    let tag
    let word
    let preTags = document.getElementsByTagName('pre')
    for (tag of preTags) {
      for (word of tag.innerText.split(' ')) {
        if (commandList.includes(word.toLowerCase())) {
          // if word is in commandList
          console.log(`FOUND COMMAND: ${word}`)
        }
      }
    }
  })
}

// Deletes the tooltip and resizes when window is resized.
window.onresize = event => {
  let oldContent
  if (tooltip) {
    oldContent = currentContent
    removeTooltip()
    createTooltip(oldContent, true)
  }
}

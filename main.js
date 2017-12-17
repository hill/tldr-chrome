/*
TODO

[x] search for word in github
[x] load relavent markdown
[ ] display markdown in tooltip
[ ] search for keywords in pre and code tags
    - display underline
    - allow click and open tooltip

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

function createTooltip(content) {

}

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

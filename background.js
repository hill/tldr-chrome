chrome.contextMenus.create({
  title: 'tldr',
  contexts: ['selection'],
  onclick: sendToContext
})

function sendToContext (word) {
  console.log(`recieved: ${word.selectionText}`)

  chrome.tabs.query({currentWindow: true, active: true}, tabArray => {
    console.log(tabArray)
    chrome.tabs.sendMessage(tabArray[0].id, {word: word.selectionText})
  })
}

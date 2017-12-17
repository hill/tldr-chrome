/*
TODO

[ ] search for word in github
[ ] load relavent markdown
[ ] display markdown in tooltip
[ ] search for keywords in pre and code tags
    - display underline
    - allow click and open tooltip

*/


chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(request.word)
  });

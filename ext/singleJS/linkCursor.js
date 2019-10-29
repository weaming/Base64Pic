let links = document.getElementsByTagName("a");
let imgURL = chrome.extension.getURL("static/img/handCursor.png");
for (let i = 0; i < links.length; i++) {
  if (links[i].target === "_blank") {
    links[i].style.cursor = 'url("' + imgURL + '"), pointer';
  }
}


// Google searchEngine
chrome.storage.sync.get(["searchEngine"], function(settings) {
  if (!settings.searchEngine) {
    chrome.tabs.create({
      url: "chrome://extensions/?options=" + chrome.runtime.id
    });
  }
});

chrome.omnibox.onInputEntered.addListener(omniboxFunc);

function omniboxFunc(text) {
  chrome.storage.sync.get(["searchEngine"], function(settings) {
    window.open(settings.searchEngine + "/search?q=" + text, "_blank");
  });
}

//Right click menu
function getBase64Image(img) {
  var canvas = document.createElement("canvas");
  canvas.width = img.width;
  canvas.height = img.height;

  var ctx = canvas.getContext("2d");
  ctx.drawImage(img, 0, 0, img.width, img.height);

  var dataURL = canvas.toDataURL("image/png");
  // return dataURL.replace("data:image/png;base64,", "");
  return dataURL;
}

function base64EncodeImage(info, tab) {
  var img = document.createElement("img");
  img.src = info.srcUrl;
  img.onload = function() {
    var data = getBase64Image(img);
    var tmp = document.createElement("p");
    document.body.appendChild(tmp);
    tmp.innerHTML = data;

    var range = document.createRange();
    range.selectNode(tmp);
    window.getSelection().addRange(range);
    try {
      // Now that we've selected the anchor text, execute the copy command
      var result = document.execCommand("copy");
      tmp.parentNode.removeChild(tmp);
      var msg = result ? "successful" : "unsuccessful";
      alert("Parse image " + msg + "\n\n" + info.srcUrl);
    } catch (err) {
      console.log("Oops, unable to copy");
    }
  };
}

function POST(API, data, cbJSON) {
  fetch(API, {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, cors, *same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    headers: {
      "Content-Type": "application/json"
    },
    redirect: "follow", // manual, *follow, error
    referrer: "no-referrer", // no-referrer, *client
    body: JSON.stringify(data)
  })
    .then(res => res.json())
    .then(cbJSON)
    .catch(error => console.log("Error:", error));
}

const copyToClipboard = str => {
  // Create a <textarea> element
  // Set its value to the string that you want copied
  // Make it readonly to be tamper-proof

  // Move outside the screen to make it invisible
  // Append the <textarea> element to the HTML document

  // Check if there is any content selected previously
  // Store selection if found
  // Mark as false to know no selection existed before
  // Select the <textarea> content
  // Copy - only works as a result of a user action (e.g. click events)
  // Remove the <textarea> element
  // If a selection existed before copying
  // Unselect everything on the HTML document
  // Restore the original selection
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  const selected =
    document.getSelection().rangeCount > 0
      ? document.getSelection().getRangeAt(0)
      : false;
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
  if (selected) {
    document.getSelection().removeAllRanges();
    document.getSelection().addRange(selected);
  }
};

function collectImage(info, tab) {
  let url = info.srcUrl;
  let API = "https://api.drink.cafe/api/services/images.create";
  chrome.storage.sync.get(["APICollectImage"], function(settings) {
    if (settings.APICollectImage) {
      API = settings.APICollectImage;
    }
    POST(
      API,
      {
        url: url,
        title: document.title,
        meta: {
          via: "chrome extenion"
        }
      },
      function(reponse) {
        console.log(response);
        chrome.notifications.create(url, {
          type: "basic",
          title: "ToolsBox",
          iconUrl: url,
          message: `succeed collect ${url}`
        }),
          function() {
            if (chrome.runtime.lastError) {
              alert(chrome.runtime.lastError.message);
            }
          };
      }
    );
  });
}

function uploadImageSMMS(info, tab) {
  let url = info.srcUrl;
  let API = "https://hooks.drink.cafe/hook/smms";
  chrome.storage.sync.get(["APIForwardSMMS"], function(settings) {
    if (settings.APIForwardSMMS) {
      API = settings.APIForwardSMMS;
    }
    POST(
      API,
      {
        url: url
      },
      function(response) {
        if (response.success) {
          copyToClipboard(response.url);
          chrome.notifications.create(
            url,
            {
              type: "basic",
              title: "ToolsBox",
              iconUrl: url,
              message: `succeed upload ${url}`
            },
            function() {
              if (chrome.runtime.lastError) {
                alert(chrome.runtime.lastError.message);
              }
            }
          );
        } else {
          console.log(response);
        }
      }
    );
  });
}

let menuProperties = [
  {
    title: "Base64编码当前图片",
    contexts: ["image"],
    onclick: base64EncodeImage
  },
  {
    title: "收藏这张图片",
    contexts: ["image"],
    onclick: collectImage
  },
  {
    title: "上传图床 sm.ms",
    contexts: ["image"],
    onclick: uploadImageSMMS
  }
];

menuProperties.forEach(function(createProperties) {
  chrome.contextMenus.create(createProperties);
});

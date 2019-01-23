// Google searchEngine
chrome.storage.sync.get(['searchEngine'], function(settings) {
    if (!settings.searchEngine) {
        chrome.tabs.create({
            'url': 'chrome://extensions/?options=' + chrome.runtime.id
        });
    }
});

chrome.omnibox.onInputEntered.addListener(omniboxFunc);

function omniboxFunc(text) {
    chrome.storage.sync.get(['searchEngine'], function(settings) {
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
    return dataURL
}

function base64EncodeImage(info, tab) {
    var img = document.createElement('img');
    img.src = info.srcUrl;
    img.onload = function() {
        var data = getBase64Image(img);
        var tmp = document.createElement("p")
        document.body.appendChild(tmp);
        tmp.innerHTML = data;

        var range = document.createRange();
        range.selectNode(tmp);
        window.getSelection().addRange(range);
        try {
            // Now that we've selected the anchor text, execute the copy command
            var result = document.execCommand('copy');
            tmp.parentNode.removeChild(tmp);
            var msg = result ? 'successful' : 'unsuccessful';
            alert('Parse image ' + msg + '\n\n' + info.srcUrl);
        } catch (err) {
            console.log('Oops, unable to copy');
        }
    }
}

function collectImage(info, tab) {
    let url = info.srcUrl;
    let API = 'https://api.drink.cafe/api/services/images.create';
    chrome.storage.sync.get(['APICollectImage'], function(settings) {
        if (settings.APICollectImage) {
            API = settings.APICollectImage
        }
        doRequest(API, url)
    })
}

function doRequest(API, url) {
    fetch(API, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, cors, *same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            headers: {
                "Content-Type": "application/json",
            },
            redirect: "follow", // manual, *follow, error
            referrer: "no-referrer", // no-referrer, *client
            body: JSON.stringify({
                "url": url,
                "title": document.title,
                "meta": {
                    "via": "chrome extenion"
                }
            })
        })
        .then(res => res.json())
        .then(reponse => {
            chrome.notifications.create(
                notificationId = url,
                options = {
                    "type": "basic",
                    "title": "ToolsBox",
                    "iconUrl": url,
                    "message": `succeed collect ${url}`,
                },
                function() {
                    if (chrome.runtime.lastError) {
                        alert(chrome.runtime.lastError.message);
                    }
                })
        })
        .catch(error => console.log('Error:', error));
}

let menuProperties = [{
        "title": "Base64编码当前图片",
        "contexts": ["image"],
        "onclick": base64EncodeImage
    },
    {
        "title": "收藏这张图片",
        "contexts": ["image"],
        "onclick": collectImage,
    },
]

menuProperties.forEach(
    function(createProperties) {
        chrome.contextMenus.create(createProperties);
    }
)

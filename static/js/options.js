// https://developer.chrome.com/extensions/storage

function saveSettings() {
    let settings = {
        'searchEngine': $("#searchEngine").val(),
        'APICollectImage': $("#APICollectImage").val(),
    }
    chrome.storage.sync.set(settings, function() {
        console.log('Saved!', settings)
    });
}

$("#saveButton").click(saveSettings);
$(window).keydown(function(e) {
    /*ctrl+s or command+s*/
    if ((e.metaKey || e.ctrlKey) && e.keyCode == 83) {
        saveSettings();
        e.preventDefault();
        return false;
    }
});

chrome.storage.sync.get(['searchEngine', 'APICollectImage'], function(settings) {
    let defaultAPICollectImage = 'https://api.drink.cafe/api/services/images.create';
    let defaultSearchEngine = "https://g.bitsflow.org";
    console.log('Got settings', settings)

    if (!settings.APICollectImage) {
        $("#APICollectImage").val(defaultAPICollectImage);
    } else {
        $("#APICollectImage").val(settings.APICollectImage);
    }

    if (!settings.searchEngine) {
        $("#searchEngine").val(defaultSearchEngine);
    } else {
        $("#searchEngine").val(settings.searchEngine);
    }

    saveSettings();
});

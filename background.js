var variableElement;
console.log('Your required HTML is saved in myVar variable.')

chrome.browserAction.onClicked.addListener(function (tab) {    
    chrome.tabs.query({
        currentWindow: true,
        active: true
    }, function (tabs) {        
        var updateProperties = {
            "active": true
        };
        chrome.tabs.update(tabs[0].id, updateProperties, function (tab) {
            chrome.browserAction.setIcon({path: 'green.png'});
            chrome.tabs.executeScript(tab.id, {
                file: "content_script.js"
            }, function () {
                if (chrome.runtime.lastError) {
                    alert('Current page is blocking extension');
                    chrome.browserAction.setIcon({path: 'red.png'});                    
                    return;
                }
            });

        });
    });
});

chrome.runtime.onMessage.addListener(
    function(result){ 
        console.log('Message Recieved.')
        variableElement = result.myHTML;
        variableElement = variableElement.replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        if(result.close == true){
            chrome.browserAction.setIcon({path: 'red.png'}); 
        }


        // your required HTML is saved in myTag
        myVar = variableElement;
        // write your code using the variable from here ...
        
        
    }
);
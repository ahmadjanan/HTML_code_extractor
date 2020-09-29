var addonlastElement = null;
var addonDrag = false;
var myElement;

function mouseoutHandler(e) {
    $(this).removeClass("addon-hover");
}

function mouseoverHandler(e) {
    myElement = $(this).html();
    myElement = myElement.replace(/</g, "&lt;");
    myElement = myElement.replace(/>/g, "&gt;");
    console.log(myElement);
    chrome.runtime.sendMessage({'myHTML': myElement, 'close':false}, function(response) {});
    
    if (addonDrag) return;
    if ($(".addon-footer").length === 0) return;
    if ($(".addon-footer").data("stop")) return;

    $(this).addClass("addon-hover").parents().removeClass("addon-hover");

    document.getElementById('myVar').innerHTML = myElement;


    e.stopPropagation();

    $("#addonPath").html($(this).getPath());

    if (typeof $(this).attr('id') == 'undefined') $("#addonId").html("none");
    else $("#addonId").html($(this).attr('id'));

    if (typeof $(this).attr('class') == 'undefined') $("#addonClassName").html("none");
    else $("#addonClassName").html($(this).attr('class'));

    document.getElementById('myVar').setAttribute('data-clipboard-text', myElement);
    
    addonlastElement = $(this);
    
    
    addonlastElement.draggable({
      start: startDrag,
      stop: stopDrag
    });
}

function stopDrag(){
    addonDrag= false;
}

function startDrag(){
    addonDrag = true;
}

function initHover() {
    chrome.storage.sync.get('typeSettings', function (settings) {
        if (typeof settings.typeSettings != 'undefined' && settings.typeSettings != "") {
            $(settings.typeSettings.toString().replace(/,/g, ", ")).not(".addon-footer, .addon-footer " + settings.typeSettings.toString().replace(/,/g, ", .addon-footer ")).mouseover(mouseoverHandler).mouseout(mouseoutHandler);
        }
    });
};



function createFooter() {
    $("body").append("<div class=\"addon-footer\" data-stop=\"false\">" +
        "<div class=\"addon-close-button\" title=\"Close\"></div>" +

        "<div class=\"addon-types\">" +
        "<div class=\"addon-label\">Element types</div>" +
        "<div class=\"addon-type addon-type-div\">DIV</div>" +
        "<div class=\"addon-type addon-type-span\">SPAN</div>" +
        "<div class=\"addon-type addon-type-ul\">UL</div>" +
        "<div class=\"addon-type addon-type-li\">LI</div>" +
        "<div class=\"addon-type addon-type-table\">TABLE</div>" +
        "<div class=\"addon-type addon-type-tr\">TR</div>" +
        "<div class=\"addon-type addon-type-td\">TD</div>" +
        "<div class=\"addon-type addon-type-a\">A</div>" +
        "<div class=\"addon-type addon-type-form\">FORM</div>" +
        "<div class=\"addon-type addon-type-frame\">FRAME</div>" +
        "<div class=\"addon-type addon-type-iframe\">IRAME</div>" +
        "<div class=\"addon-type addon-type-button\">BUTTON</div>" +
        "<div class=\"addon-type addon-type-article\">ARTICLE</div>" +
        "<div class=\"addon-type addon-type-h1\">H1</div>" +
        "<div class=\"addon-type addon-type-h2\">H2</div>" +
        "<div class=\"addon-type addon-type-h3\">H3</div>" +
        "<div class=\"addon-type addon-type-h4\">H4</div>" +
        "<div class=\"addon-type addon-type-h5\">H5</div>" +
        "<div class=\"addon-type addon-type-h6\">H6</div>" +
        "<div class=\"addon-type addon-type-img\">IMG</div>" +
        "<div class=\"addon-type addon-type-input\">INPUT</div>" +
        "<div class=\"addon-type addon-type-textarea\">TEXTAREA</div>" +
        "<div class=\"addon-type addon-type-option\">OPTION</div>" +
        "<div class=\"addon-clearfix\"></div>" +
        "</div>" +
        "<div class=\"addon-label\">HTML Element</div> <div id='myVar'> </div>"+
        "<div class=\"addon-label\">Unique path</div> <div class=\"addon-value\" id =\"addonPath\">none</div>" +
        "<div class=\"addon-label\">Id</div> <div class=\"addon-value\" id =\"addonId\">none</div>" +
        "<div class=\"addon-label\">Class name</div> <div class=\"addon-value\" id =\"addonClassName\">none</div>" +
        "</div>");
};

function saveFunction(e) {
    if (e.ctrlKey && e.keyCode == 83) {
        $(".addon-footer").data("stop", !$(".addon-footer").data("stop"));
        $(".addon-footer").toggleClass("addon-foter-save");
        e.stopPropagation();
        e.preventDefault();
    }

    if (addonlastElement != null && typeof addonlastElement != 'undefined') {
        if (e.keyCode == 46) {

            addonlastElement.remove();
            addonlastElement = null;
        }
    }
};

function removeAddon() {
    $(".addon-footer").remove();
};


function initButton() {
    $('.addon-close-button').click(function () {
        chrome.runtime.sendMessage({'myHTML': myElement, 'close': true}, function(response) {});
        removeAddon();
    });

    $('.addon-type').click(function () {
        addOrRemoveType($(this));
    });

    $('.addon-types').hide();

    $('.addon-settings-button').click(function () {
        $('.addon-types').toggle();
    });


    new Clipboard('.addon-copy-button');

};

function addOrRemoveType(elem) {

    var html = elem.html().toLowerCase();
    var selectedClass = "addon-type-selected";
    var isAdded = !elem.hasClass(selectedClass);


    chrome.storage.sync.get('typeSettings', function (settings) {

        var arrayTypes = [];
        if (typeof settings.typeSettings != 'undefined') {
            arrayTypes = settings.typeSettings;
        }

        if (isAdded) {
            arrayTypes.push(html);
        } else {


            var index = arrayTypes.indexOf(html);
            if (index !== -1) {
                arrayTypes.splice(index, 1);
            }
        }

        chrome.storage.sync.set({
            'typeSettings': arrayTypes
        }, function () {
            if (isAdded) {
                elem.addClass(selectedClass);
            } else {
                elem.removeClass(selectedClass);
            }

            chrome.storage.sync.set({
                'userModifySettings': true
            }, function () {});
        });
    });
};

function initKeyCapture() {
    $(document).off('keydown');
    $(document).on('keydown', saveFunction);
};

function setDefaultTypes() {
    chrome.storage.sync.get('userModifySettings', function (settings) {
        if (typeof settings.userModifySettings == 'undefined') {
            chrome.storage.sync.set({
                'typeSettings': ["div", "span", "ul", "table", "a"]
            }, function () {
                setButtonTypes();
            });
        } else {
            setButtonTypes();
        }
    });
}

function setButtonTypes() {
    chrome.storage.sync.get('typeSettings', function (settings) {
        for (var i = 0; i < settings.typeSettings.length; i++) {
            $(".addon-type-" + settings.typeSettings[i]).addClass("addon-type-selected");
        }

        initHover();
    });
}

function setTypesChangesListener() {
    chrome.storage.onChanged.addListener(function (changes, namespace) {
        for (key in changes) {
            if (key == "typeSettings") {
                if (changes.typeSettings.oldValue.toString() != "") {
                    $(changes.typeSettings.oldValue.toString().replace(/,/g, ", ")).not(".addon-footer, .addon-footer " + changes.typeSettings.oldValue.toString().replace(/,/g, ", .addon-footer ")).unbind("mouseover", mouseoverHandler);
                    $(changes.typeSettings.oldValue.toString().replace(/,/g, ", ")).not(".addon-footer, .addon-footer " + changes.typeSettings.oldValue.toString().replace(/,/g, ", .addon-footer ")).unbind("mouseout", mouseoutHandler);

                }
                initHover();
            }
        }
    });
}

$(function () {
    removeAddon();

    setDefaultTypes();
    setTypesChangesListener();

    createFooter();
    initButton();
    initKeyCapture();
});
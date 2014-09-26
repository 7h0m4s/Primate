var _errorPage_name = "Error-page.html";
var _undefined = "undefined";
var _backspace_keycode = 8;

var calFrameHeight = function () {
    var headerDimensions = $('header.bg-blue').height();
    var bordertopbottom = 4;
    $('#content-detail').height($(window).height() - headerDimensions - bordertopbottom);
}

var urlObject = function (options) {
    "use strict";
    /*global window, document*/
    var url_search_arr,
        option_key,
        i,
        urlObj,
        get_param,
        key,
        val,
        url_query,
        url_get_params = {},
        a = document.createElement('a'),
        default_options = {
            'url': window.location.href,
            'unescape': true,
            'convert_num': true
        };

    if (typeof options !== "object") {
        options = default_options;
    } else {
        for (option_key in default_options) {
            if (default_options.hasOwnProperty(option_key)) {
                if (options[option_key] === undefined) {
                    options[option_key] = default_options[option_key];
                }
            }
        }
    }

    a.href = options.url;
    url_query = a.search.substring(1);
    url_search_arr = url_query.split('&');

    if (url_search_arr[0].length > 1) {
        for (i = 0; i < url_search_arr.length; i += 1) {
            get_param = url_search_arr[i].split("=");

            if (options.unescape) {
                key = decodeURI(get_param[0]);
                val = decodeURI(get_param[1]);
            } else {
                key = get_param[0];
                val = get_param[1];
            }

            if (options.convert_num) {
                if (val.match(/^\d+$/)) {
                    val = parseInt(val, 10);
                } else if (val.match(/^\d+\.\d+$/)) {
                    val = parseFloat(val);
                }
            }

            if (url_get_params[key] === undefined) {
                url_get_params[key] = val;
            } else if (typeof url_get_params[key] === "string") {
                url_get_params[key] = [url_get_params[key], val];
            } else {
                url_get_params[key].push(val);
            }
            get_param = [];
        }
    }
    urlObj = {
        protocol: a.protocol,
        hostname: a.hostname,
        host: a.host,
        port: a.port,
        hash: a.hash.substr(1),
        pathname: a.pathname,
        search: a.search,
        parameters: url_get_params
    };
    return urlObj;
}

var evaluateStatusCode = function () {
    var urlObj = urlObject();
    if (urlObj.pathname.indexOf(_errorPage_name)) {
        var statusCode = urlObj.parameters.code;
        if (typeof statusCode != _undefined) {
            $("#statusCode").html(statusCode);
        }
    }
}

var responsiveFrame = function () {
    $(window).resize(function () {
        calFrameHeight();
    }).load(function () {
        calFrameHeight();
    });
}

var contextMenu = function () {
    var fileChild = $(".file-child");
    if (fileChild.length > 0) {
        $.contextMenu({
            selector: '.file-child',
            callback: function (key, options) {
                // $(this); here refers to the object that is being clicked --> <div class="context-menu-one" id="t1" name="name1">
                var m = "clicked: " + key;
                window.console && console.log(m) || alert(m);
            },
            items: {
                "RedirectUrl": {
                    name: "Redirect to website",
                },
                "sep1": "---------",
                "viewAcc": {
                    name: "View account",
                },
                "editAcc": {
                    name: "Edit account",
                },
                "delAcc": {
                    name: "Delete account",
                },
                "sep2": "---------",
                "copyCuser": {
                    name: "Copy username",
                },
                "copyPasswrd": {
                    name: "Copy password",
                },
            }
        });
    }
}

//due to jquery version, it throws an error. try catch can patch it properly
var initSplitter = function () {
    try {
        $('#main').split({ orientation: 'vertical', limit: 220, position: '20%' });
        $('.side-content').split({ orientation: 'vertical', limit: 220, position: '40%' });
    } catch (ex) {
        //console.log(ex.message);
    }
};

var unbindBackspace = function () {
    //prevent backspance button navigate back in all browser
    $(document).unbind('keydown').bind('keydown', function (event) {
        var doPrevent = false;
        if (event.keyCode === _backspace_keycode) {
            var d = event.srcElement || event.target;
            if ((d.tagName.toUpperCase() === 'INPUT' &&
                 (
                     d.type.toUpperCase() === 'TEXT' ||
                     d.type.toUpperCase() === 'PASSWORD' ||
                     d.type.toUpperCase() === 'FILE' ||
                     d.type.toUpperCase() === 'EMAIL' ||
                     d.type.toUpperCase() === 'SEARCH' ||
                     d.type.toUpperCase() === 'DATE')
                 ) ||
                 d.tagName.toUpperCase() === 'TEXTAREA') {
                doPrevent = d.readOnly || d.disabled;
            }
            else {
                doPrevent = true;
            }
        }
        if (doPrevent) {
            event.preventDefault();
        }
    });

};

var self_invoke_func = (function () {
    contextMenu();
    responsiveFrame();
    unbindBackspace();
})();

var init = function () {
    calFrameHeight();
    evaluateStatusCode();
    initSplitter();
};

$(function () {
    init();
    setTimeout(function () { $('.example').animate({ margin: "0", opacity: '1', }, 600); $("#loader").hide(); }, 2000);
});


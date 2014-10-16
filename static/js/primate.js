var _errorPage_name = "static/Error-page.html";
var _urlLoginRedirect = "dashboard";
var _undefined = "undefined";
var GROUP_CONTEXT_NAME_OBJ = {
    NAME_GROUP_DETAIL: "Group Detail",
    NAME_EDIT_GROUP: "Edit Group",
    NAME_DELETE_GROUP: "Delete Group"
};

var USER_CONTEXT_NAME_OBJ = {
    NAME_ACCOUNT_DETAIL: "View Account",
    NAME_EDIT_ACCOUNT: "Edit Account",
    NAME_DELETE_ACCOUNT: "Delete Account"
};


var _urlViewGroup = "#/group-view-template";
var _urlEditGroup = "#/group-edit-template";
var _urlDelGroup = "#/group-delete-template";

var _urlViewAccount = "#/user-view-template";
var _urlCreateAccount = "#/user-create-template";
var _urlEditAccount = "#/user-edit-template";
//var _urlDelAccount = "#/";


var _backspace_keycode = 8;
var DEFAULT_STATUS_CODE = 404;
var calFrameHeight = function () {
    var headerDimensions = $('header.bg-blue').height();
    var bordertopbottom = 4;
    $('#content-detail').height($(window).height() - headerDimensions - bordertopbottom);
}

//todo test
//var calAddButtonPortionHeight = setInterval(function () {
//    var sideMidHeight = $('.side-mid').height();
//    var bcrumbHeight = $('#bcrumb').height();
//    var listviewOutlookHeight = $('.listview-outlook').height();
//    $(".add-group-portion").height(sideMidHeight - bcrumbHeight - listviewOutlookHeight - 14);
//}, 100);

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
        } else {
            $("#statusCode").html(DEFAULT_STATUS_CODE);
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
    var obj = $(".file-child");
    if (obj.length > 0) {
        $.contextMenu({
            selector: '.file-child',
            callback: function (key, options) {
                // $(this); here refers to the object that is being clicked --> <div class="context-menu-one" id="t1" name="name1">
                ///main.html#/group-edit-template
                //console.log($(this));
                //var m = "clicked: " + key;
                //window.console && console.log(m) || alert(m);
            },
            items: {
                "RedirectUrl": {
                    name: "Redirect to Website",
                },
                "sep1": "---------",
                "viewAcc": {
                    name: USER_CONTEXT_NAME_OBJ.NAME_ACCOUNT_DETAIL,
                },
                "editAcc": {
                    name: USER_CONTEXT_NAME_OBJ.NAME_EDIT_ACCOUNT,
                },
                "delAcc": {
                    name: USER_CONTEXT_NAME_OBJ.NAME_DELETE_ACCOUNT,
                },
                "sep2": "---------",
                "copyCuser": {
                    name: "Copy Username",
                },
                "copyPasswrd": {
                    name: "Copy Password",
                },
            }
        });
    }
};

var contextFileGroupMenu = function () {
    var obj = $(".file-group");
    if (obj.length > 0) {
        $.contextMenu({
            selector: '.file-group',
            callback: function (key, options) {
            },
            items: {
                "ViewGroup": {
                    name: GROUP_CONTEXT_NAME_OBJ.NAME_GROUP_DETAIL,
                },
                "EditGroup": {
                    name: GROUP_CONTEXT_NAME_OBJ.NAME_EDIT_GROUP,
                },
                "DeleteGroup": {
                    name: GROUP_CONTEXT_NAME_OBJ.NAME_DELETE_GROUP,
                }
            }
        });
    }
};

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
    contextFileGroupMenu();
    responsiveFrame();
    unbindBackspace();
})();

var init = function () {
    calFrameHeight();
    evaluateStatusCode();
    initSplitter();
    loadingWrapper();
};

$(function () {
    init();
    //setTimeout(function () { $('.example').animate({ margin: "0", opacity: '1', }, 500); $("#loader").hide(); }, 350);
});


var loadingWrapper = function () {
    $('#loader-wrapper').delay(350).fadeOut('fast');
};

var ajaxPost = function ($formObj, isAsync, requestUrl, successFunc, failureFunc) {
    var method = "Post";
    var url = "";
    if (!requestUrl) {
        url = $formObj.attr("target");
    } else {
        url = requestUrl;
    }
    var postData = $formObj.serialize();
    $.ajax({
        type: method,
        url: url,
        data: postData,
        async: isAsync
    }).done(function (msg) {
        successFunc(msg);
    }).fail(function (msg) {
        failureFunc(msg);
    });
};

var ajaxGet = function (isAsync, requestUrl, postData, successFunc, failureFunc) {
    var method = "Post";
    var url = requestUrl;
    $.ajax({
        data: postData,
        type: method,
        url: url,
        async: isAsync
    }).done(function (msg) {
        successFunc(msg);

    }).fail(function (msg) {
        failureFunc(msg);
    });
};


var triggerDialog = function ($title, $content) {
    $.Dialog({
        overlay: true,
        shadow: true,
        flat: true,
        title: $title,
        content: $content,
        padding: 10,
        onShow: function () {
            $.Metro.initInputs();
        }
    });
};


var initSelect2 = function (data) {
    $(".select-search").select2({
        data: data
    });
};

//submit animation
var submitAnimatel = function () {
    if ($(".submit-animate").length) {
        $(".submit-animate").html("Process").attr("disabled", "");
        var defaultVal = $(".submit-animate").html();
        console.log(defaultVal);
        var count = 0;
        var submitAnimateInterval = setInterval(function () {
            var appendVal = $(".submit-animate").html() + ".";
            if (count == 4) {
                $(".submit-animate").html(defaultVal);
                count = 0;
            }
            else {
                $(".submit-animate").html(appendVal);
            }
            if (!$(".submit-animate").length) {
                clearInterval(submitAnimateInterval);
            }
            count++;
        }, 500);
    }
}

var closeSilder = function () {
    $(".slide-right-wrapper").animate({ 'opacity': 0 });
    $(".slide-right-panel").animate({ 'margin-right': '-320px', 'opacity': -0.5, 'filter': 'alpha(opacity=-150)' }, function () {
        $(".slide-right").hide();
    });
};

var hideLoader = function () {
    setTimeout(function () {
        $('.example').animate({ margin: "0", opacity: '1', }, 500);
        $("#loader").hide();
    }, 250);
};


var redirect = function (url) {
    //window.location.href = url;
};

var redirectToErroPage = function () {
    //window.location.href = _urlErrorPage404;
};

var redirectToErroPage505 = function () {
    //window.location.href = _urlErrorPage505;
};

var redirectToMainPage = function () {
    //window.location.href = _urlLoginRedirect;
};

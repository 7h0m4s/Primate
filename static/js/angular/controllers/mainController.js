var _NO_GROUP_NAME = "Empty Group";
var _NOTIFI_SETTING_CAPTION = "Setting";
var _NOTIFI_GROUP_CAPTION = "Group";
var _DEFAULT_FAILURE_CAPTION = "Error";
var _DEFAULT_SUCCESS_MSG = "Saved successfully";
var _DEFAULT_FAILURE_MSG = "Save failed";
var _EDIT_SUCCESS_MSG = "Edit successfully";
var _backspace_keycode = 8;
var _defaultCheckboxValue = "on";
var _urlErrorPage404 = "static/error-page.html";
var _urlErrorPage505 = "static/error-page.html?code=505";
var _urlExportDialogTemplate = "static/dialog-export-template.html";
var _urlImportDialogTemplate = "static/dialog-import-template.html";
var _urlSaveUserSetting = "/config-set";
var _urlGetUserSetting = "config-get";
var _urlGetTree = "get-db-json";
var _urlGetTree2 = "json/tree-data2.txt";
var _urlBrowse = "json/url-browse.txt";
//var _urlBrowse = "/import-browse";
var _urlImportSubmit = "/import-direct";
var _urlCreateGroupSubmit = "/create-group";
var _urlEditGroupSubmit = "/edit-group";

var global_tree = null;

var mainApp = angular.module("mainApp", ['ngRoute'])
.config(function ($routeProvider, $locationProvider) {
    $routeProvider
        //.when('/', {
        //    template: '<h1>Not applicable</h1>',
        //    controller: 'mainController'
        //})
        .when('/group-create-template', {
            templateUrl: 'static/group-create-template.html',
            controller: 'mainController'
        })
        .when('/group-edit-template', {
            templateUrl: 'static/group-edit-template.html',
            controller: 'mainController'
        })
        .when('/group-view-template', {
            templateUrl: 'static/group-view-template.html',
            controller: 'mainController'
        });
    //.otherwise({
    //    redirectTo: '/'
    //});
})

.factory('requestFactory', function ($q, $http) {
    var myService = {
        get: function (url) {
            var deferred = $q.defer();
            var def = $q.defer();
            request(def, url);
            def.promise.then(function (datas) {
                deferred.resolve(datas);
            });
            return deferred.promise;
        }
    }
    function request(def, url) {
        $http.get(url).then(function (response) {
            def.resolve(response.data);
        });
    }
    return myService;
})

.controller('mainController', function ($scope, $http, $q, $compile, $window, $location, requestFactory, $routeParams) {
    $scope.childIndex = -1;
    $scope.breadcrumbs = [];
    $scope.templates = { cacheExportDialogTemplate: "", cacheImportDialogTemplate: "" }
    $scope.importFile = {};
    $scope.userSetting = null;
    $scope.tree = null;
    $scope.group = {};

    $scope.init = function () {
        initTree($scope);
        initSetting($scope);
    };

    $scope.$watch('userSetting', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            $("#passwrdMinLenth").val($scope.userSetting.passwrdMinLenth);
            $("#sessionTimeOut").val($scope.userSetting.sessionTimeOut);
            var isCheck;
            isCheck = $scope.userSetting.isLowercase == _defaultCheckboxValue;
            $("#isLowercase").prop('checked', isCheck);
            isCheck = $scope.userSetting.isUppercase == _defaultCheckboxValue;
            $("#isUppercase").prop('checked', isCheck);
            isCheck = $scope.userSetting.isDigit == _defaultCheckboxValue;
            $("#isDigit").prop('checked', isCheck);
            isCheck = $scope.userSetting.isSymbol == _defaultCheckboxValue;
            $("#isSymbol").prop('checked', isCheck);
        }
    });

    $scope.AssessName = function (str) {
        if (str.length == 0) {
            return _NO_GROUP_NAME;
        }
        return str;
    };

    $scope.SelectRoot = function (obj) {
        addParentToEachChild(obj);
        $scope.breadcrumbs = [];
        setGroupandChildren($scope, obj);
        $scope.breadcrumbs.push(obj);
    };

    $scope.NavIn = function (obj) {
        addParentToEachChild(obj);
        resetChildIndex();
        setGroupandChildren($scope, obj);
        $scope.breadcrumbs.push(obj);
    };

    $scope.BreadcrumbRedirect = function (obj) {
        setGroupandChildren($scope, obj);
        resetChildIndex();
        for (var a = 0; a < $scope.breadcrumbs.length; a++) {
            if ($scope.breadcrumbs[a] == obj) {
                $scope.breadcrumbs.splice(a + 1, $scope.breadcrumbs.length - a);
            }
        }
    };

    $scope.SetActive = function (index, $event) {
        $($event.target).closest(".group-content").find("a").removeClass("active");
        $($event.target).closest("a").addClass("active");
        $scope.childIndex = index;
    };

    $scope.Back = function ($event) {
        var currentKeyCode = $event.keyCode;
        if (currentKeyCode == _backspace_keycode) {
            var backcrumbIndex = $scope.breadcrumbs.length - 2;
            if (backcrumbIndex >= 0) {
                $scope.BreadcrumbRedirect($scope.breadcrumbs[backcrumbIndex]);
            }
        }
    };

    $scope.SubmitSettingForm = function () {
        ajaxPost($("#settingForm"), true, _urlSaveUserSetting, function (msg) {
            notifiSuccess(_NOTIFI_SETTING_CAPTION);
            closeSilder();
        },
        function (msg) {
            notifiFailure();
            closeSilder();
        });
    };

    $scope.TriggerSlider = function () {
        $(".slide-right").show();
        $(".slide-right-wrapper").animate({ 'opacity': 0.3, 'filter': 'alpha(opacity=30)' });
        $(".slide-right-panel").animate({ 'margin-right': 0, 'opacity': 1, 'filter': 'alpha(opacity=100)' });
    };

    $scope.CloseSlider = function () {
        closeSilder();
    };

    $scope.TriggerExportDialog = function ($title) {
        getImportFileInfo();
        if ($scope.templates.cacheExportDialogTemplate) {
            triggerDialog($title, getCompileContent($scope.templates.cacheExportDialogTemplate));
        } else {
            $http.get(_urlExportDialogTemplate).success(function ($content) {
                $scope.templates.cacheExportDialogTemplate = $content;
                var $compileContent = getCompileContent($content);
                triggerDialog($title, $compileContent);
            })
            .error(function ($content, status) {
                redirectToError505();
            });
        }
    };

    $scope.TriggerImportDialog = function ($title) {
        if ($scope.templates.cacheImportDialogTemplate) {
            triggerDialog($title, getCompileContent($scope.templates.cacheImportDialogTemplate));
        } else {
            $http.get(_urlImportDialogTemplate).success(function ($content) {
                $scope.templates.cacheImportDialogTemplate = $content;
                var $compileContent = getCompileContent($content);
                triggerDialog($title, $compileContent);
            })
            .error(function ($content, status) {
                redirectToError505();
            });
        }
    };

    $scope.Browse = function () {
        $.get(_urlBrowse, function (data) {
            $("#import-dialog .file-path").val(data);
        });
    };

    $scope.ImportSubmit = function () {
        ajaxPost(null, true, _urlImportSubmit, function () { }, function () { });
        initTree2($scope);
        initTree($scope);
        $.Dialog.close();
    };

    $scope.InitGroupManagment = function () {
        resetScopeGroup();
        var groupArr = getAllGroup(global_tree);
        calFrameHeight();
        initSelect2(groupArr);
        hideLoader();
        initGroupId();
    };

    $scope.EditGroupSubmit = function () {
        ajaxPost($("#editGroupForm"), true, _urlEditGroupSubmit, function (msg) {
            notifiSuccess(_NOTIFI_SETTING_CAPTION, _EDIT_SUCCESS_MSG);
        }, function () {
            redirectToError505();
        });
    };

    $scope.GetGroupId = function () {
        var stringConcat = "";
        for (var a = 0; a < $scope.breadcrumbs.length; a++) {
            if (a == 0) {
                stringConcat = $scope.breadcrumbs[a].groupName;
            } else {
                stringConcat += "." + $scope.breadcrumbs[a].groupName;
            }
        }
        return stringConcat;
    };

    $scope.SubmitCreateGroupForm = function (isValid) {
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#createGroupForm"), true, _urlCreateGroupSubmit, function () {
                initTree();
            },
            function () {
                redirectToError505();
            });
        } else {
            redirectToError505();
        }
    };

    $scope.SubmitEditGroupForm = function (isValid) {
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#editGroupForm"), true, _urlEditGroupSubmit, function () {
                initTree();
            },
            function () {
                redirectToError505();
            });
        } else {
            redirectToError505();
        }
    }

    $scope.RedirectGroupCreate = function () {
        var currentGroupIdObj = { groupParent: $(".breadcrumb").attr("data-breadcrumb-arr") }
        var serializedCurrentGroupId = $.param(currentGroupIdObj);
        $window.location.href = "dashboard#/group-create-template?" + serializedCurrentGroupId;
    };

    var initGroupId = function () {
        $("#groupParent").select2("val", $routeParams.groupParent);
        $scope.group.groupName = $routeParams.groupName;
    }

    //todo test whether it is needed
    var addParentToEachChild = function (obj) {
        //for (var a = 0; a < obj.children.length; a++) {
        //    obj.children[a].parent = obj;
        //}
    };

    var setGroupandChildren = function (scope, obj) {
        scope.groups = obj.groups;
        scope.children = obj.children;
    };

    var resetChildIndex = function () {
        $scope.childIndex = -1;
    };

    var getImportFileInfo = function () {
        //todo ajax get file info
        $scope.importFile = { date: "2014/09/29 04:10PM", size: "10.45 KB" };
    };

    var getCompileContent = function ($content) {
        return $compile($content)($scope)[0];
    };

    var notifiSuccess = function (_caption, msg) {
        if (!msg) {
            msg = _DEFAULT_SUCCESS_MSG;
        }
        $.Notify({ style: { background: '#1ba1e2', color: 'white' }, caption: _caption, content: msg });
    };

    var notifiFailure = function (_caption, msg) {
        if (!_caption) {
            _caption = _DEFAULT_FAILURE_CAPTION;
        }
        if (!msg) {
            msg = _DEFAULT_FAILURE_MSG;
        }
        $.Notify({ style: { background: 'red', color: 'white' }, caption: _caption, content: msg });
    };

    var redirectToError505 = function () {
        $window.location.href = _urlErrorPage505;
    };

    var initSetting = function (scope) {
        requestFactory.get(_urlGetUserSetting).then(function (data) {
            scope.userSetting = data;
        });
    };
    var initTree = function (scope) {
        requestFactory.get(_urlGetTree).then(function (data) {
            scope.tree = data;
            global_tree = data;
        });
    };

    //todo test only to be removed
    var initTree2 = function (scope) {
        requestFactory.get(_urlGetTree2).then(function (data) {
            scope.tree = data;
        });
    };

    // group model
    var GroupModel = function (id, text) {
        this.id = id;
        this.text = text;
    };

    var getAllGroup = function (tree) {
        var groupArr = [];
        var emptyGroup = new GroupModel("", "");
        groupArr.push(emptyGroup);
        var rootGroupObj = tree;
        var recursiveGroup = function (idChain, textChain, tree) {
            for (var a = 0; a < tree.groups.length; a++) {
                if (rootGroupObj == tree) {
                    idChain = "";
                    textChain = "";
                }
                if (tree.groups[a] != null) {
                    var groupName = tree.groups[a].groupName;
                    if (idChain.length > 0) {
                        textChain = textChain + " / " + groupName;
                        idChain = idChain + "." + groupName;
                    } else {
                        idChain = groupName;
                        textChain = groupName;
                    }
                    var group = new GroupModel(idChain, textChain);
                    groupArr.push(group);
                    recursiveGroup(idChain, textChain, tree.groups[a]);
                }
            }
        };
        recursiveGroup("", "", tree);
        return groupArr;
    };

    var resetScopeGroup = function () {
        $scope.group = {};
    };

    var treeGroupModel = function (groupName, children, groups) {
        this.groupName = groupName;
        this.children = [];
        this.children = children;
        this.groups = [];
        this.groups = groups;
    }

    $(".context-menu-item").on("click", function () {
        var itemName = $(this).context.innerText.trim();

        if (contextGroupRedirectManagement(itemName)) {
            return;
        }
        else if (true) {
            return;
        }
    });

    var contextGroupRedirectManagement = function (itemName) {
        if (itemName == GROUP_CONTEXT_NAME_OBJ.NAME_GROUP_DETAIL) {
            redirect(_urlViewGroup);
            return true;
        }
        else if (itemName == GROUP_CONTEXT_NAME_OBJ.NAME_EDIT_GROUP) {
            var currentGroupObj = { groupParent: $(".breadcrumb").attr("data-breadcrumb-arr"), groupName: $($(".active")).find(".list-title").html() }
            var serializedCurrentGroup = $.param(currentGroupObj);
            redirect(_urlEditGroup + "?" + serializedCurrentGroup);
            return true;
        }
        else if (itemName == GROUP_CONTEXT_NAME_OBJ.NAME_DELETE_GROUP) {
            return true;
        }
        return false;
    }
});

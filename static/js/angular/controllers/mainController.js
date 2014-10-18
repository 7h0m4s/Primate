var _NO_GROUP_NAME = "Empty Group";
var _NOTIFI_SETTING_CAPTION = "Setting";
var _NOTIFI_GROUP_CAPTION = "Group";
var _NOTIFI_ACCOUNT_CAPTION = "Account";
var _DEFAULT_FAILURE_CAPTION = "Error";
var _DEFAULT_SUCCESS_MSG = "Saved successfully";
var _DEFAULT_FAILURE_MSG = "Save failed";
var _EDIT_SUCCESS_MSG = "Edit successfully";
var _ADD_SUCCESS_MSG = "Add successfully";
var _backspace_keycode = 8;
var _defaultCheckboxValue = "on";
var _urlErrorPage404 = "static/error-page.html";
var _urlErrorPage505 = "static/error-page.html?code=505";
var _urlExportDialogTemplate = "/static/dialog-export-template.html";
var _urlImportDialogTemplate = "/static/dialog-import-template.html";
var _urlMasterPasswordDialogTemplate = "/static/dialog-master-password-edit-template.html";
var _urlDeleteAccountTemplate = "/static/dialog-delete-account-template.html";
var _urlSaveUserSetting = "/config-set";
var _urlGetUserSetting = "config-get";
var _urlGetTree = "get-db-json";
var _urlBrowse = "/import-browse";
var _urlImportSubmit = "/import-direct";
var _urlCreateGroupSubmit = "/create-group";
var _urlEditGroupSubmit = "/edit-group";
var _urlCreateUserSubmit = "/create-user";
var _urlEditUserSubmit = "/edit-user";
var _urlGetUser = "/get-user";
var _GROUP_CONCAT_SYMBOL = ".";
var _EMPTY_NAME = "N/A";
var _urlSetFilePath = "/set-filePath";

var _urlResetMasterPassword = "/new-master-password"; //post
//new Password
//old Password

var _CONTENT_COPY = "/copy";
var _CONTEXT_ATTRIBUTE = {
    USERNAME: "username",
    PASSWORD: "password",
    URL: "url"
};

var global_tree = null;

var mainApp = angular.module("mainApp", ['ngRoute', 'ngStorage'])
.config(function ($routeProvider, $locationProvider) {
    $routeProvider
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
        })
        .when('/user-view-template', {
            templateUrl: 'static/user-view-template.html',
            controller: 'mainController'
        })
        .when('/user-edit-template', {
            templateUrl: 'static/user-edit-template.html',
            controller: 'mainController'
        })
         .when('/user-create-template', {
             templateUrl: 'static/user-create-template.html',
             controller: 'mainController'
         })
        .when('/test-form-template', {
            templateUrl: 'test-form-template.html',
            controller: 'mainController'
        });
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
        },
        post: function (url, requestData) {
            var deferred = $q.defer();
            var def = $q.defer();
            requestPost(def, url, requestData);
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
    function requestPost(def, url, requestData) {
        ajaxGet(true, url, requestData, function (response) {
            def.resolve(response);
        }, function (response) {
            redirectToErroPage505();
        });
    }
    return myService;
})

.controller('mainController', function ($scope, $http, $q, $compile, $window, $location, requestFactory, $routeParams, $localStorage) {
    $scope.childIndex = -1;
    //$scope.breadcrumbs = [];
    $scope.templates = { cacheExportDialogTemplate: "", cacheImportDialogTemplate: "", cacheDeleteAccountTemplate: "" }
    $scope.userSetting = null;
    //$scope.tree = null;
    $scope.group = {};
    //$scope.groups = {};
    //$scope.children = {};

    $scope.init = function () {
        initTree($scope);
        initSetting($scope);
        //console.log($scope.groups);
        readFromLocalStorage();
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

    $scope.$watch('groups', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            $localStorage.groups = $scope.groups;
        }
    });

    $scope.$watch('children', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            $localStorage.children = $scope.children;
        }
    });

    $scope.$watch('breadcrumbs', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            $localStorage.breadcrumbs = $scope.breadcrumbs;
        }
    });

    var readFromLocalStorage = function () {
        $scope.groups = $localStorage.groups;
        $scope.children = $localStorage.children;
        if (!$localStorage.breadcrumbs) {
            $scope.breadcrumbs = [];
        } else {
            $scope.breadcrumbs = $localStorage.breadcrumbs;
        }
    };

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
        var testArr = [0, 1, 2, 3, 4];
        console.log("before");
        console.log(testArr);
        delete testArr[0];
        console.log("testArr");
        console.log(testArr);


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
        if ($scope.templates.cacheExportDialogTemplate) {
            triggerDialog($title, getCompileContent($scope.templates.cacheExportDialogTemplate));
        } else {
            $http.get(_urlExportDialogTemplate).success(function ($content) {
                $scope.templates.cacheExportDialogTemplate = $content;
                var $compileContent = getCompileContent($content);
                triggerDialog($title, $compileContent);
            })
            .error(function ($content, status) {
                redirectToErroPage505();
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
                redirectToErroPage505();
            });
        }
    };

    $scope.TriggerMasterPasswordDialog = function ($title) {
        $http.get(_urlMasterPasswordDialogTemplate).success(function ($content) {
            var $compileContent = getCompileContent($content);
            triggerDialog($title, $compileContent);
        })
        .error(function ($content, status) {
            redirectToErroPage505();
        });
    };


    $scope.TriggerDeleteAccountDialog = function ($title) {
        if ($scope.templates.cacheDeleteAccountTemplate) {
            triggerDialog($title, getCompileContent($scope.templates.cacheDeleteAccountTemplate));
        } else {
            $http.get(_urlDeleteAccountTemplate).success(function ($content) {
                $scope.templates.cacheDeleteAccountTemplate = $content;
                var $compileContent = getCompileContent($content);
                triggerDialog($title, $compileContent);
            })
            .error(function ($content, status) {
                redirectToErroPage505();
            });
        }
    };

    $scope.OpenImportFileDialog = function () {
        ajaxGetMethod(true, _urlGetFilePath, {}, function (content) {
            debugger;
            if (content.length != 0) {
                $("#importFileInput").val(content);
                setimportInputModified();
                setimportInputNotRequired();
            }
        }, function () {
            redirectToErroPage505();
        });
    };

    $scope.ImportSubmit = function () {
        ajaxPost($("#importFileInput"), true, _urlImportSubmit, function (msg) {
            if (msg.length == 0) {
                redirect(_urlLoginRedirect);
            } else {
                $("#import-customMsg").html(msg);
            }
        }, function () { });

    };

    $scope.InitGroupManagment = function () {
        resetScopeGroup();
        var groupArr = getAllGroup(global_tree);
        calFrameHeight();
        initSelect2(groupArr);
        initGroupId();
        hideLoader();
    };

    $scope.EditGroupSubmit = function () {
        ajaxPost($("#editGroupForm"), true, _urlEditGroupSubmit, function (msg) {
            notifiSuccess(_NOTIFI_SETTING_CAPTION, _EDIT_SUCCESS_MSG);
        }, function () {
            redirectToErroPage505();
        });
    };

    $scope.GetGroupId = function () {
        var stringConcat = "";
        for (var a = 0; a < $scope.breadcrumbs.length; a++) {
            if (a == 0) {
                stringConcat = $scope.breadcrumbs[a].groupName;
            } else {
                stringConcat += _GROUP_CONCAT_SYMBOL + $scope.breadcrumbs[a].groupName;
            }
        }
        return stringConcat;
    };

    $scope.SubmitCreateGroupForm = function (isValid) {
        var groupParentVal = $("#groupParent").val();
        var groupNameVal = $("#groupName").val();

        if (groupNameVal.indexOf(_GROUP_CONCAT_SYMBOL) > -1) {
            return;
        }
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#createGroupForm"), true, _urlCreateGroupSubmit, function () {
                var newGroupObj = { groupName: groupNameVal, children: [], groups: [] };
                console.log($scope.tree);
                if (groupParentVal.length == 0) {
                    $scope.tree.groups.push(newGroupObj);
                } else {
                    addGroupFromNewTreeByParentName(groupParentVal, newGroupObj, true);
                }
                notifiSuccess(_NOTIFI_GROUP_CAPTION, _ADD_SUCCESS_MSG);
                var serializedCurrentGroup = prepareGroupUrl(groupParentVal, groupNameVal);
                redirect(_urlViewGroup + "?" + serializedCurrentGroup);
            },
        function () {
            redirectToErroPage505();
        });
        } else {
            redirectToErroPage505();
        }
    };

    $scope.SubmitEditGroupForm = function (isValid) {
        var groupParentVal = $("#groupParent").val();
        var groupNameVal = $("#groupName").val();
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#editGroupForm"), true, _urlEditGroupSubmit, function () {
                console.log($scope.oldGroup);
                var deletedObj = deleteGroupFromNewTreeByParentName($scope.oldGroup.groupParent, $scope.oldGroup, true);
                console.log(deletedObj);
                deletedObj.groupName = groupNameVal;
                if (groupParentVal.length == 0) {
                    $scope.tree.groups.push(deletedObj);
                } else {
                    addGroupFromNewTreeByParentName(groupParentVal, deletedObj, true);
                }
                notifiSuccess(_NOTIFI_SETTING_CAPTION, _EDIT_SUCCESS_MSG);
                var serializedCurrentGroup = prepareGroupUrl(groupParentVal, groupNameVal);
                redirect(_urlViewGroup + "?" + serializedCurrentGroup);
            },
                function () {
                    redirectToErroPage505();
                });
        } else {
            redirectToErroPage505();
        }
    };

    $scope.SubmitCreateAccountForm = function (isValid) {
        var groupParentVal = $("#groupParent").val();
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#createAccountForm"), true, _urlCreateUserSubmit, function (uuid) {
                $scope.account.uuid = uuid;
                processAccountScope();
                addGroupFromNewTreeByParentName(groupParentVal, $scope.account, false);
                var currentGroupObj = { uuid: uuid }
                var serializedCurrentGroup = $.param(currentGroupObj);
                redirect(_urlViewAccount + "?" + serializedCurrentGroup);
                notifiSuccess(_NOTIFI_ACCOUNT_CAPTION, _ADD_SUCCESS_MSG);
            },
            function () {
                redirectToErroPage505();
            });
        } else {
            redirectToErroPage505();
        }
    };

    $scope.SubmitEditAccountForm = function (isValid) {
        var groupParentVal = $("#groupParent").val();
        var uuidObj = { uuid: $("#uuid").val() };
        console.log(uuidObj);
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#editAccountForm"), true, _urlEditUserSubmit, function () {
                processAccountScope();
                ajaxGet(false, _urlGetUser, uuidObj, function (response) {
                    $scope.account = $.parseJSON(response);
                    debugger;
                    deleteGroupFromNewTreeByParentName($scope.oldAccountGroupParent, $scope.oldAccount, false);
                    addGroupFromNewTreeByParentName(groupParentVal, $scope.account, false);
                    notifiSuccess(_NOTIFI_ACCOUNT_CAPTION, _EDIT_SUCCESS_MSG);
                    redirectWithExistingParms(_urlViewAccount);
                }, function (response) {
                    redirectToErroPage505();
                });


            },
            function () {
                redirectToErroPage505();
            });
        } else {
            redirectToErroPage505();
        }
    };

    //todo refractor
    $scope.RedirectGroupCreate = function () {
        var currentGroupIdObj = { groupParent: getGroupParent() }
        var serializedCurrentGroupId = $.param(currentGroupIdObj);
        redirect(_urlCreateGroup + "?" + serializedCurrentGroupId);
    };

    $scope.RedirectUserCreate = function () {
        var currentGroupIdObj = { groupParent: getGroupParent() }
        var serializedCurrentGroupId = $.param(currentGroupIdObj);
        redirect(_urlCreateAccount + "?" + serializedCurrentGroupId);
    };

    $scope.RedirectFromViewToGroupEdit = function () {
        redirectWithExistingParms(_urlEditGroup);
    };

    $scope.RedirectFromViewToUserEdit = function () {
        redirectWithExistingParms(_urlEditAccount);
    };

    $scope.InitAccountManagment = function () {
        resetScopeGroup();
        var groupArr = getAllGroup(global_tree);
        calFrameHeight();
        initSelect2(groupArr);
        hideLoader();
        var uuid = initAccountId();
        prepareAccountForm(uuid);
    };

    $scope.ViewAccountDetail = function () {
        prepareRedirectAcco(_urlViewAccount);
    }

    $scope.ReplaceEmptyToNA = function (str) {
        if (!str.trim()) {
            return _EMPTY_NAME;
        }
        return str;
    };

    var initAccountId = function () {
        var uuid = $routeParams.uuid;
        $("#uuid").val(uuid);
        return uuid;
    };

    var prepareAccountForm = function (uuid) {
        var uuidObj = { uuid: uuid };
        var $groupParent = $("#groupParent");
        if (!isUndifined(uuid)) {
            ajaxGet(false, _urlGetUser, uuidObj, function (response) {
                $scope.account = $.parseJSON(response);
                if ($groupParent.length > 0) {
                    $groupParent.select2("val", $scope.account.groupParent);
                }
                //todo tobe continued
                $scope.oldAccount = {};
                $scope.oldAccountGroupParent = $scope.account.groupParent;
                $.extend($scope.oldAccount, $scope.account);
            }, function (response) {
                redirectToErroPage505();
            });
        } else {
            resetScopeAccount();
            $groupParent.select2("val", $routeParams.groupParent);
        }
    };

    var initGroupId = function () {
        $("#groupParent").select2("val", $routeParams.groupParent);
        $scope.group.groupName = $routeParams.groupName;
        $scope.group.groupParent = $routeParams.groupParent;
        var preGroup = $routeParams.groupParent + _GROUP_CONCAT_SYMBOL + $routeParams.groupName;
        $("#preGroup").val(preGroup);
        $scope.oldGroup = {};
        $.extend($scope.oldGroup, $scope.group);
        if (!$routeParams.groupName) {
            return null;
        }
        return preGroup;
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

    var initSetting = function (scope) {
        requestFactory.get(_urlGetUserSetting).then(function (data) {
            scope.userSetting = data;
        });
    };

    var initTree = function (scope) {
        requestFactory.get(_urlGetTree).then(function (data) {
            console.log(data);
            $scope.tree = data;
            global_tree = data;
        });
    };

    // group model
    var GroupModel = function (id, text, disabled) {
        this.id = id;
        this.text = text;
        this.disabled = disabled;
    };

    var getAllGroup = function (tree) {
        var preGroup = null;
        if (!isUndifined($routeParams.groupName)) {
            preGroup = $routeParams.groupParent + _GROUP_CONCAT_SYMBOL + $routeParams.groupName;
        }
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
                        idChain = idChain + _GROUP_CONCAT_SYMBOL + groupName;
                    } else {
                        idChain = groupName;
                        textChain = groupName;
                    }
                    var group = new GroupModel(idChain, textChain, false);

                    if (idChain.indexOf(preGroup) == 0) {
                        group.disabled = true;
                    }
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
        else if (contextAccountRedirectManagement(itemName)) {
            return;
        }
        else if (true) {
            return;
        }
    });

    var contextGroupRedirectManagement = function (itemName) {
        if (itemName == GROUP_CONTEXT_NAME_OBJ.NAME_GROUP_DETAIL) {
            var detailCurrentGroupObj = {
                groupParent: getGroupParent(),
                groupName: getGroupName()
            }
            var detailSerializedCurrentGroup = $.param(detailCurrentGroupObj);
            redirect(_urlViewGroup + "?" + detailSerializedCurrentGroup);
            return true;
        }
        else if (itemName == GROUP_CONTEXT_NAME_OBJ.NAME_EDIT_GROUP) {
            var currentGroupParent = getGroupParent();
            var currentGroupName = getGroupName();
            var serializedCurrentGroup = prepareGroupUrl(currentGroupParent, currentGroupName);
            redirect(_urlEditGroup + "?" + serializedCurrentGroup);
            return true;
        }
        else if (itemName == GROUP_CONTEXT_NAME_OBJ.NAME_DELETE_GROUP) {
            return true;
        }
        return false;
    }

    var contextAccountRedirectManagement = function (itemName) {
        if (itemName == USER_CONTEXT_NAME_OBJ.NAME_ACCOUNT_DETAIL) {
            prepareRedirectAcco(_urlViewAccount);
            return true;
        }
        else if (itemName == USER_CONTEXT_NAME_OBJ.NAME_EDIT_ACCOUNT) {
            prepareRedirectAcco(_urlEditAccount);
            return true;
        }
        else if (itemName == USER_CONTEXT_NAME_OBJ.NAME_DELETE_ACCOUNT) {
            triggerDialog("Delete", "");
            return true;
        }
        else if (itemName == USER_CONTEXT_NAME_OBJ.NAME_COPY_URL) {
            ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.URL }, _CONTENT_COPY, function () { });
            return true;
        }
        else if (itemName == USER_CONTEXT_NAME_OBJ.NAME_COPY_PASSWORD) {
            ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.PASSWORD }, _CONTENT_COPY, function () { });
            return true;
        }
        else if (itemName == USER_CONTEXT_NAME_OBJ.NAME_COPY_USERNAME) {
            ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.USERNAME }, _CONTENT_COPY, function () { });
            return true;
        }
        else if (itemName == USER_CONTEXT_NAME_OBJ.NAME_REDIRECT_URL) {
            ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.USERNAME }, _CONTENT_COPY, function (url) {
                window.open(url, '_blank');
            });
            return true;
        }
        return false;
    }

    var prepareRedirectAcco = function (url) {
        var uuid = getUuid();
        var currentGroupObj = { uuid: uuid }
        var serializedCurrentGroup = $.param(currentGroupObj);
        redirect(url + "?" + serializedCurrentGroup);
    };

    var prepareGroupUrl = function (groupParent, groupName) {
        var currentGroupObj = { groupParent: groupParent, groupName: groupName }
        return $.param(currentGroupObj);
    };

    var getGroupParent = function () {
        return $(".breadcrumb").attr("data-breadcrumb-arr");
    };

    var getGroupName = function () {
        return $($(".active .list-title")).html();
    };

    var getUuid = function () {
        return $($(".active .account-uuid")).html();
    };

    var redirectWithExistingParms = function (url) {
        var redirectParms = $.param($routeParams);
        redirect(url + "?" + redirectParms);
    }

    var resetScopeAccount = function () {
        $scope.account = {};
    }

    var resetGroupBreadChildren = function () {
        $scope.groups = {};
        $scope.children = {};
        $scope.breadcrumbs = [];
    }

    //var testGetTree = function () {
    //    //ajaxGet(true, _urlGetTree, {}, function (msg) {
    //    //    console.log("testtt");
    //    //    debugger;
    //    //    var aa = $.parseJSON(msg);
    //    //    $scope.tree = $.parseJSON(msg);
    //    //}, function () { });

    //    $scope.$apply(function () {
    //        requestFactory.get(_urlGetTree).then(function (data) {
    //            $scope.tree = data;
    //            global_tree = data;
    //            $scope.tree.groups = data.groups;
    //        });
    //    });
    //};

    //$scope.$watch('tree', function (newValue, oldvalue) {
    //    if (newValue != oldvalue) {
    //        console.log(oldvalue);
    //        alert("tree editted");
    //        console.log(newValue);
    //    }
    //});

    var groupObj = function (groupParentIndex, groupName) {
        this.groupParentIndex = groupParentIndex;
        this.groupName = groupName;
    };


    var addGroupFromNewTreeByParentName = function (groupParentIndex, newObj, isGroup) {
        var groupArr = groupParentIndex.split('.');
        var count = 0;
        var resultObj;
        var recursiveGroup = function (tree) {
            for (var a = 0; a < tree.groups.length; a++) {
                if (tree.groups[a] != null) {
                    var groupName = tree.groups[a].groupName;
                    if (groupName == groupArr[count]) {
                        if (count == groupArr.length - 1) {
                            if (isGroup) {
                                resultObj = tree.groups[a].groups.push(newObj);
                            } else {
                                resultObj = tree.groups[a].children.push(newObj);
                            }
                        } else {
                            count++;
                        }
                    }
                    recursiveGroup(tree.groups[a]);
                }
            }
        };
        if ($scope.tree != null) {
            recursiveGroup($scope.tree);
        }
        return resultObj;
    }

    var deleteGroupFromNewTreeByParentName = function (groupParentIndex, oldObj, isGroup) {
        var groupArr = groupParentIndex.split('.');
        var count = 0;
        var resultObj = null;
        var recursiveGroup = function (tree) {
            if (resultObj == null) {
                for (var a = 0; a < tree.groups.length; a++) {
                    if (tree.groups[a] != null) {
                        var groupName = tree.groups[a].groupName;
                        if (groupName == groupArr[count]) {
                            if (count == groupArr.length - 1) {
                                if (isGroup) {
                                    for (var b = 0; b < tree.groups[a].groups.length; b++) {
                                        if (tree.groups[a].groups[b].groupName == oldObj.groupName) {
                                            resultObj = tree.groups[a].groups[b];
                                            tree.groups[a].groups.splice(b, 1);
                                            break;
                                        }
                                    }
                                } else {
                                    for (var c = 0; c < tree.groups[a].children.length; c++) {
                                        if (tree.groups[a].children[c].uuid == oldObj.uuid) {
                                            resultObj = tree.groups[a].children[c];
                                            tree.groups[a].children.splice(c, 1);
                                            break;
                                        }
                                    }
                                }
                            } else {
                                count++;
                            }
                        }
                        recursiveGroup(tree.groups[a]);
                    }
                }
            }
        };
        if ($scope.tree != null) {
            recursiveGroup($scope.tree);
        }
        return resultObj;
    }

    var processAccountScope = function () {
        if (isUndifined($scope.account.uuid)) {
            $scope.account.uuid = "";
        }
        if (isUndifined($scope.account.user)) {
            $scope.account.user = "";
        }
        if (isUndifined($scope.account.passwd)) {
            $scope.account.passwd = "";
        }
        if (isUndifined($scope.account.title)) {
            $scope.account.title = "";
        }
        if (isUndifined($scope.account.url)) {
            $scope.account.url = "";
        }
        if (isUndifined($scope.account.notes)) {
            $scope.account.notes = "";
        }
    };

    var setimportInputModified = function () {
        console.log($scope.fileImportForm);
        $scope.fileImportForm.file.$dirty = true;
        $scope.fileImportForm.file.$setValidity();
    }

    var hahaah = true;
    var setimportInputNotRequired = function () {
        $scope.fileImportForm.file.$setValidity('required', true);
        console.log($scope.fileImportForm.file.$error.required);
        $scope.fileImportForm.file.required = true;
        console.log($scope.fileImportForm.file.$error.required);
        $scope.fileImportForm.file.$error.required = true;
        console.log($scope.fileImportForm.file.$error.required);
        hahaah = false;
    }
});


//var findGroupFromNewTreeByParentName = function (groupParentIndex, newGroupObj) {
//    var groupArr = groupParentIndex.split('.');
//    var count = 0;
//    var resultObj;
//    var recursiveGroup = function (tree) {
//        for (var a = 0; a < tree.groups.length; a++) {
//            if (tree.groups[a] != null) {
//                var groupName = tree.groups[a].groupName;
//                if (groupName == groupParentIndex) {
//                    resultObj = tree.groups[a].groups.push(newGroupObj);
//                }
//                recursiveGroup(tree.groups[a]);
//            }
//        }
//    };
//    if ($scope.tree != null) {
//        recursiveGroup($scope.tree);
//    }
//    return resultObj;
//}

//mainApp.directive('notargetSymbol', [function () {
//    return {
//        restrict: 'A',
//        scope: true,
//        link: function (scope, elem, attrs, val, control) {
//            var checker = function () {
//                debugger;
//                var targetVal = scope.$eval(attrs.context.val);
//                console.log(targetVal);
//                //targetVal.indexOf(_GROUP_CONCAT_SYMBOL) > 0
//                return true;
//            };
//            scope.$watch(checker, function (n) {
//                console.log(n);
//                //control.$setValidity("dot", n);
//            });
//        }
//    };
//}]);
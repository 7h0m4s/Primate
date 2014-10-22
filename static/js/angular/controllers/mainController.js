var _NO_GROUP_NAME = "Empty Group";
var _NOTIFI_SETTING_CAPTION = "Setting";
var _NOTIFI_GROUP_CAPTION = "Group";
var _NOTIFI_ACCOUNT_CAPTION = "Account";
var _NOTIFI_CLIPBOARD_CAPTION = "Clipboard";
var _NOTIFI_MASTERPASSWORD_CAPTION = "Master Password";
var _NOTIFI_IMPORT_CAPTION = "Import";
var _Import_SUCCESS_MSG = "Import successfully";
var _DEFAULT_FAILURE_CAPTION = "Error";
var _DEFAULT_SUCCESS_MSG = "Saved successfully";
var _DEFAULT_FAILURE_MSG = "Save failed";
var _EDIT_SUCCESS_MSG = "Edit successfully";
var _DELETE_SUCCESS_MSG = "Detele successfully";
var _ADD_SUCCESS_MSG = "Add successfully";
var _COPY_URL_MSG = "Copy URL successfully";
var _COPY_USERNAME_MSG = "Copy username successfully";
var _COPY_PASSWORD_MSG = "Copy password successfully";
var _backspace_keycode = 8;
var _defaultCheckboxValue = "on";
var _urlErrorPage404 = "static/error-page.html";
var _urlErrorPage505 = "static/error-page.html?code=505";
var _urlExportDialogTemplate = "/static/dialog-export-template.html";
var _urlImportDialogTemplate = "/static/dialog-import-template.html";
var _urlMasterPasswordDialogTemplate = "/static/dialog-master-password-edit-template.html";
var _urlDeleteAccountTemplate = "/static/dialog-delete-account-template.html";
var _urlDeleteGroupTemplate = "/static/dialog-delete-group-template.html";
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
var _VALIDATE_DOT = '.';
var _EMPTY_NAME = "N/A";
var _DEFAULT_PWD_LENGTH = 12;
var _urlSetFilePath = "/set-filepath";
var _urlDeleteUser = "/delete-user";
var _urlDeleteGroup = "/delete-group";
var _urlResetMasterPassword = "/new-master-password"; //post
var _urlRedirectHomeNoRefresh = "/dashboard#";
var _UNTITLE = "Untitled";
var _SLASH = " / ";
var _PREFIX = "http://";
//new Password
//old Password
var _TIME_REDIRECT = 1500;
var _TIME_SHOWPASSWORD = 1500;
var _CONTENT_COPY = "/copy";
var _CONTEXT_ATTRIBUTE = {
    USERNAME: "username",
    PASSWORD: "password",
    URL: "url"
};

var numberRegex = /\d+/;
var lowerCaseRegex = /[a-z]+/;
var updateCaseRegex = /[A-Z]+/;
var symbolRegex = /[!@#$%^&*()_+=\[{\]};:<>|./?,\\'""-]+/;

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
.directive('passwordPolicy', [
    function () {
        return {
            restrict: 'A',
            scope: true,
            require: 'ngModel',
            link: function (scope, elem, attrs, control) {
                var checker = function () {
                    var val = elem.context.value;
                    var check = true;
                    if (isLowercase()) {
                        check = check && lowerCaseRegex.test(val);
                    }
                    if (isUppercase()) {
                        check = check && updateCaseRegex.test(val);

                    }
                    if (isDigit()) {
                        check = check && numberRegex.test(val);

                    }
                    if (isSymbol()) {
                        check = check && symbolRegex.test(val);
                    }
                    return check;
                };
                scope.$watch(checker, function (n) {
                    control.$setValidity("passwordpolicy", n);
                });
            }
        };
    }
])

.directive('passwordMatch', [function () {
    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function (scope, elem, attrs, control) {
            var checker = function () {
                var e1 = scope.$eval(attrs.ngModel);
                var e2 = scope.$eval(attrs.passwordMatch);
                return e1 == e2;
            };
            scope.$watch(checker, function (n) {
                if (n) {
                    $(".login-validate").eq(2).slideUp("fast");
                } else {
                    $(".login-validate").eq(2).slideDown("fast");
                }
                control.$setValidity("unique", n);
            });
        }
    };
}])

.directive('minpwdLength', [function () {
    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function (scope, elem, attrs, control) {
            var checker = function () {
                var val = elem.context.value;
                return val.length >= $("#passwrdMinLenth").val();
            };
            scope.$watch(checker, function (n) {
                control.$setValidity("minpwdlength", n);
            });
        }
    };
}])
.directive('notargetSymbol', [function () {
    return {
        restrict: 'A',
        scope: true,
        require: 'ngModel',
        link: function (scope, elem, attrs, control) {
            var checker = function () {
                var val = elem.context.value;
                if (!isUndifined(val)) {
                    var isValid = !(val.indexOf(_VALIDATE_DOT) > -1);
                    return isValid;
                }
                return true;
            };
            scope.$watch(checker, function (n) {
                control.$setValidity("dot", n);
            });
        }
    };
}])

//.directive('notDuplicateGroup', [function () {
//    return {
//        restrict: 'A',
//        scope: true,
//        require: 'ngModel',
//        link: function (scope, elem, attrs, control) {
//            var checker = function () {
//                if (!isUndifined(val)) {
//                    var isValid = !(val.indexOf(_VALIDATE_DOT) > -1);
//                    return isValid;
//                }
//                return true;
//            };
//            scope.$watch(checker, function (n) {
//                control.$setValidity("duplicategroup", n);
//            });
//        }
//    };
//}])
.controller('mainController', function ($scope, $http, $q, $compile, $window, $location, requestFactory, $routeParams, $localStorage) {
    var lockFileDialog = false;
    $scope.childIndex = -1;
    $scope.templates = { cacheExportDialogTemplate: "", cacheImportDialogTemplate: "", cacheDeleteAccountTemplate: "" }
    $scope.userSetting = null;
    $scope.group = {};
    $scope.file = {};
    $scope.init = function () {
        initTree($scope);
        initSetting($scope);
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

    $scope.$watch('account.passwd', function (newValue, oldvalue) {
        if (typeof newValue == "string") {
            if (lowerCaseRegex.test(newValue)) {
                addApprovedClass("#password-contain-lowercase");
            } else {
                removeApprovedClass("#password-contain-lowercase");
            }

            if (updateCaseRegex.test(newValue)) {
                addApprovedClass("#password-contain-uppercase");
            } else {
                removeApprovedClass("#password-contain-uppercase");
            }

            if (numberRegex.test(newValue)) {
                addApprovedClass("#password-contain-numbers-special");
            } else {
                removeApprovedClass("#password-contain-numbers-special");
            }

            if (symbolRegex.test(newValue)) {
                addApprovedClass("#password-contain-mixed-symbol");
            } else {
                removeApprovedClass("#password-contain-mixed-symbol");
            }
        }
    });



    $scope.$watch('breadcrumbs', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            $localStorage.breadcrumbs = $scope.breadcrumbs;
        }
    });

    var readFromLocalStorage = function () {
        if (isUndifined($scope.tree)) {
            $scope.breadcrumbs = {};
            return;
        }
        if (!$localStorage.breadcrumbs) {
            $scope.breadcrumbs = [];
            $scope.groups = {};
            $scope.children = {};
        } else {
            $scope.breadcrumbs = $localStorage.breadcrumbs;
            syncBreadCrumbByFindingObj($scope.breadcrumbs);
            var lastIndex = $scope.breadcrumbs.length - 1;
            $scope.groups = $scope.breadcrumbs[lastIndex].groups;
            $scope.children = $scope.breadcrumbs[lastIndex].children;
        }
    };

    $scope.AssessName = function (str) {
        if (str.length == 0) {
            return _NO_GROUP_NAME;
        }
        return str;
    };

    $scope.SelectRoot = function (obj) {
        $scope.breadcrumbs = [];
        setGroupandChildren($scope, obj);
        $scope.breadcrumbs.push(obj);
    };

    $scope.NavIn = function (obj) {
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
            settingPGenerator();
            closeSilder();
        },
        function (msg) {
            notifiFailure();
            closeSilder();
        });
    };

    $scope.TriggerSlider = function () {
        initSetting($scope);
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
        $scope.file.filePath = "";
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
        $scope.master = {};
        $http.get(_urlMasterPasswordDialogTemplate).success(function ($content) {
            var $compileContent = getCompileContent($content);
            triggerDialog($title, $compileContent);
        })
        .error(function ($content, status) {
            redirectToErroPage505();
        });
    };

    $scope.TriggerDeleteAccountDialog = function ($title) {
        $http.get(_urlDeleteAccountTemplate).success(function ($content) {
            var $compileContent = getCompileContent($content);
            return triggerDialog($title, $compileContent);
        })
        .error(function ($content, status) {
            redirectToErroPage505();
        });
    };

    $scope.DeleteAccount = function () {
        var uuid = $scope.delete.uuid;
        if (isUndifined(uuid)) {
            redirectToErroPage505();
        }
        var postData = { uuid: uuid };
        ajaxGet(true, _urlGetUser, postData, function (accountJson) {
            var accountObj = $.parseJSON(accountJson);
            ajaxGet(true, _urlDeleteUser, postData, function () {
                $.Dialog.close();
                syncBreadCrumbByFindingObj($scope.breadcrumbs);
                deleteGroupFromNewTreeByParentName(accountObj.groupParent, accountObj, false);
                selectAccountSearch();
                checkIfRedirect(uuid);
                notifiSuccess(_NOTIFI_ACCOUNT_CAPTION, _DELETE_SUCCESS_MSG);
            }, function () {
                redirectToErroPage505();
            });
        }, function () {
            redirectToErroPage505();
        });
    };

    var checkIfRedirect = function (deteledtUui) {
        var uuid = $routeParams.uuid;
        if (!isUndifined(uuid)) {
            if (uuid == deteledtUui) {
                redirect(_urlRedirectHomeNoRefresh);
            }
        }
    }

    $scope.DeleteGroup = function () {
        var groupObj = $scope.delete.group;
        console.log(groupObj);
        if (isUndifined(groupObj)) {
            redirectToErroPage505();
            return;
        }
        var postData = { group: groupObj.groupParent + _GROUP_CONCAT_SYMBOL + groupObj.groupName }
        ajaxGet(true, _urlDeleteGroup, postData, function () {
            deleteGroupFromNewTreeByParentName(groupObj.groupParent, groupObj, true);
            $.Dialog.close();
            notifiSuccess(_NOTIFI_ACCOUNT_CAPTION, _DELETE_SUCCESS_MSG);
        }, function () {
            redirectToErroPage505();
        });
    };


    $scope.OpenImportFileDialog = function () {
        if (!lockFileDialog) {
            lockFileDialog = true;
            ajaxGetMethod(true, _urlGetFilePath, {}, function (content) {
                if (content.length != 0) {
                    $("#importFileInput").val(content);
                    $("#importFileInput").change();
                }
                lockFileDialog = false;
            }, function () {
                redirectToErroPage505();
            });
        }
    };

    $scope.TriggerDeleteGroupDialog = function ($title) {
        if ($scope.templates.cacheDeleteGroupTemplate) {
            triggerDialog($title, getCompileContent($scope.templates.cacheDeleteGroupTemplate));
        } else {
            $http.get(_urlDeleteGroupTemplate).success(function ($content) {
                $scope.templates.cacheDeleteGroupTemplate = $content;
                var $compileContent = getCompileContent($content);
                return triggerDialog($title, $compileContent);
            })
            .error(function ($content, status) {
                redirectToErroPage505();
            });
        }
    };

    $scope.Browse = function () {
        $.get(_urlBrowse, function (data) {
            $("#import-dialog .file-path").val(data);
        });
    };

    $scope.ImportSubmit = function () {
        ajaxPost($("#importFileInput"), true, _urlImportSubmit, function (msg) {
            if (!msg) {
                notifiSuccess(_NOTIFI_IMPORT_CAPTION, _Import_SUCCESS_MSG);
                setTimeout(function () {
                    redirect(_urlLoginRedirect);
                }, _TIME_REDIRECT);

            } else {
                $("#import-customMsg").html(msg);
            }
        }, function () { });

    };

    $scope.InitGroupManagment = function () {
        resetScopeGroup();
        var groupArr = getAllGroup($scope.tree, false);
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

    $scope.SubmitMasterPasswordForm = function (isValid) {
        $("#master-pwd-alert").hide();
        if (isValid) {
            ajaxPost($("#masterPasswordForm"), true, _urlResetMasterPassword, function (msg) {
                if (!msg) {
                    $.Dialog.close();
                    notifiSuccess(_NOTIFI_MASTERPASSWORD_CAPTION, _DEFAULT_SUCCESS_MSG);
                } else {
                    $("#master-pwd-alert").slideDown();
                    $(".custom-error").html(msg);
                }
            },
            function () {
                redirectToErroPage505();
            });
        } else {
            redirectToErroPage505();
        }
    }


    $scope.SubmitCreateAccountForm = function (isValid) {
        var groupParentVal = $("#groupParent").val();
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#createAccountForm"), true, _urlCreateUserSubmit, function (accountJson) {
                $scope.account = $.parseJSON(accountJson);
                processAccountScope();
                addGroupFromNewTreeByParentName(groupParentVal, $scope.account, false);
                selectAccountSearch();
                var currentGroupObj = { uuid: $scope.account.uuid }
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
                    deleteGroupFromNewTreeByParentName($scope.oldAccountGroupParent, $scope.oldAccount, false);
                    addGroupFromNewTreeByParentName(groupParentVal, $scope.account, false);
                    selectAccountSearch();
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
        var groupArr = getAllGroup($scope.tree, true);
        calFrameHeight();
        initSelect2(groupArr);
        hideLoader();
        var uuid = initAccountId();
        prepareAccountForm(uuid);
        $('#passwd').change();
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

    var getAllChildren = function () {
        $scope.searchChildren = [];
        var recursiveGroup = function (tree) {
            for (var b = 0; b < tree.children.length; b++) {
                $scope.searchChildren.push(tree.children[b]);
            }
            for (var a = 0; a < tree.groups.length; a++) {
                recursiveGroup(tree.groups[a]);
            }
        };
        recursiveGroup($scope.tree);
    };

    $scope.Reveal = function (id) {
        $(id).attr("type", "text");
    };
    $scope.Hide = function (id) {
        $(id).attr("type", "password");
    };

    $scope.RevealCheckboxPassword = function (chkID, targetID) {
        var $target = $(targetID);
        var password = $target.attr("data-password");
        var mask = $target.attr("data-mask");
        if ($(chkID).is(':checked')) {
            $target.html(password);
        } else {
            $target.html(mask);
        }
    }

    $scope.IsLowercase = function () {
        return isLowercase();
    }
    $scope.IsUppercase = function () {
        return isUppercase();
    }
    $scope.IsDigit = function () {
        return isDigit();
    }
    $scope.IsSymbol = function () {
        return isDigit();
    }
    $scope.PwdLength = function () {
        return pwdLength();
    }
    $scope.Redirect = function (url) {
        redirect(url);
    };


    $scope.DisplaySearch = function () {
        getAllChildren();
        $(".default-item").hide();
        $('.active').removeClass("active");
        $(".search-item").show();
    }

    $scope.HideSearch = function () {
        $(".search-item").hide();
        $('.active').removeClass("active");
        $(".default-item").show();
    }

    $scope.ProcessAccountTitle = function ($title) {
        if (!$title) {
            return _UNTITLE;
        }
        return $title;
    }

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
                $scope.oldAccount = {};
                $scope.oldAccountGroupParent = $scope.account.groupParent;
                $.extend($scope.oldAccount, $scope.account);
            }, function (response) {
                redirectToErroPage();
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
            $scope.userSetting = data;
        });
    };

    var initTree = function (scope) {
        requestFactory.get(_urlGetTree).then(function (data) {
            $scope.tree = data;
            global_tree = data;
            $scope.delete = {};
        });
    };

    // group model
    var GroupModel = function (id, text, disabled) {
        this.id = id;
        this.text = text;
        this.disabled = disabled;
    };

    var getAllGroup = function (tree, isAccount) {
        var preGroup = null;
        if (!isUndifined($routeParams.groupName)) {
            preGroup = $routeParams.groupParent + _GROUP_CONCAT_SYMBOL + $routeParams.groupName;
        }
        var groupArr = [];  
        //make changes here for account
        if (!isAccount) {
            var emptyGroup = new GroupModel("", "");
            groupArr.push(emptyGroup);
        }
        var rootGroupObj = tree;
        var backCount = 0;
        var recursiveGroup = function (idChain, textChain, tree) {
            for (var a = 0; a < tree.groups.length; a++) {
                if (backCount >= 1) {
                    var temp = 1;
                    var tempArrID = idChain.split(_GROUP_CONCAT_SYMBOL);
                    debugger;
                    tempArrID.splice(tempArrID.length - temp, temp);
                    idChain = tempArrID.join();

                    var tempArrText = textChain.split(_SLASH);
                    tempArrText.splice(tempArrText.length - temp, temp);
                    textChain = tempArrText.join();
                    backCount = 0;
                }
                if (rootGroupObj == tree) {
                    idChain = "";
                    textChain = "";
                }
                if (tree.groups[a] != null) {
                    var groupName = tree.groups[a].groupName;
                    if (idChain.length > 0) {
                        textChain = textChain + _SLASH + groupName;
                        idChain = idChain + _GROUP_CONCAT_SYMBOL + groupName;
                    } else {
                        idChain = groupName;
                        textChain = groupName;
                    }
                    var group = new GroupModel(idChain, textChain, false);

                    if (preGroup != null && idChain.indexOf(preGroup) == 0) {
                        group.disabled = true;
                    }
                    groupArr.push(group);
                    recursiveGroup(idChain, textChain, tree.groups[a]);
                }
            }
            backCount++;
            //var tempArrID = idChain.split(_GROUP_CONCAT_SYMBOL);
            //idChain = tempArrID.splice(tempArrID.length - 1, 1).join();

            //var tempArrText = idChain.split(_SLASH);
            //textChain = tempArrText.splice(tempArrText.length - 1, 1).join();
        };
        recursiveGroup("", "", tree);
        return groupArr;
    };

    var resetScopeGroup = function () {
        $scope.group = {};
    };

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
        return $($(".active .list-title")).text();
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
                                $scope.$apply();
                            } else {
                                resultObj = tree.groups[a].children.push(newObj);
                                $scope.$apply();
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
                    if (!groupParentIndex) {
                        var rootName = tree.groups[a].groupName;
                        if (oldObj.groupName == rootName) {
                            resultObj = tree.groups[a];
                            tree.groups.splice(a, 1);
                            $scope.$apply();
                        }
                    } else {
                        if (tree.groups[a] != null) {
                            var groupName = tree.groups[a].groupName;
                            if (groupName == groupArr[count]) {
                                if (count == groupArr.length - 1) {
                                    if (isGroup) {
                                        for (var b = 0; b < tree.groups[a].groups.length; b++) {
                                            if (tree.groups[a].groups[b].groupName == oldObj.groupName) {
                                                resultObj = tree.groups[a].groups[b];
                                                tree.groups[a].groups.splice(b, 1);
                                                $scope.$apply();
                                                break;
                                            }
                                        }
                                    } else {
                                        for (var c = 0; c < tree.groups[a].children.length; c++) {
                                            if (tree.groups[a].children[c].uuid == oldObj.uuid) {
                                                console.log(tree.groups[a].children[c].uuid);
                                                console.log(oldObj.uuid);
                                                debugger;
                                                resultObj = tree.groups[a].children[c];
                                                console.log(resultObj);

                                                console.log("before");
                                                console.log(tree.groups[a].children);

                                                $scope.$apply(function () {
                                                    tree.groups[a].children.splice(c, 1);
                                                });
                                                console.log("after");
                                                console.log(tree.groups[a].children);

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
            }
        };
        if ($scope.tree != null) {
            recursiveGroup($scope.tree);
        }
        return resultObj;
    }


    var syncBreadCrumbByFindingObj = function (oldBreadcrumbObj) {
        var count = 0;
        var resultObj = null;
        var recursiveGroup = function (tree) {
            if (resultObj == null) {
                for (var a = 0; a < tree.groups.length; a++) {
                    if (tree.groups[a] != null) {
                        var groupName = tree.groups[a].groupName;
                        if (groupName == oldBreadcrumbObj[count].groupName) {
                            if (count == oldBreadcrumbObj.length - 1) {
                                resultObj = tree.groups[a];
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
    var removeAtiveElem = function () {
        $(".active").remove();
    };

    $.contextMenu({
        selector: '.file-group',
        callback: function (key, options) {
            var groupParent = getGroupParent();
            var groupName = getGroupName();
            if (key == "ViewGroup") {
                var detailCurrentGroupObj = {
                    groupParent: groupParent,
                    groupName: groupName
                }
                $scope.deleteGroup = detailCurrentGroupObj;
                var detailSerializedCurrentGroup = $.param(detailCurrentGroupObj);
                redirect(_urlViewGroup + "?" + detailSerializedCurrentGroup);
            } else if (key == "EditGroup") {
                var currentGroupParent = groupParent;
                var currentGroupName = groupName;
                var serializedCurrentGroup = prepareGroupUrl(currentGroupParent, currentGroupName);
                redirect(_urlEditGroup + "?" + serializedCurrentGroup);
            } else if (key == "DeleteGroup") {
                $scope.delete.group = {};
                $scope.delete.group.groupName = groupName;
                $scope.delete.group.groupParent = groupParent;
                $scope.TriggerDeleteGroupDialog("Delete Group");
            }
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

    $.contextMenu({
        selector: '.root-group',
        callback: function (key, options) {
            var groupName = $(this).find("a").html();
            if (key == "ViewGroup") {
                var detailCurrentGroupObj = {
                    groupParent: "",
                    groupName: groupName
                }
                $scope.deleteGroup = detailCurrentGroupObj;
                var detailSerializedCurrentGroup = $.param(detailCurrentGroupObj);
                redirect(_urlViewGroup + "?" + detailSerializedCurrentGroup);
            } else if (key == "EditGroup") {
                var currentGroupParent = "";
                var currentGroupName = groupName;
                var serializedCurrentGroup = prepareGroupUrl(currentGroupParent, currentGroupName);
                redirect(_urlEditGroup + "?" + serializedCurrentGroup);
            } else if (key == "DeleteGroup") {
                $scope.delete.group = {};
                $scope.delete.group.groupName = groupName;
                $scope.delete.group.groupParent = "";
                $scope.TriggerDeleteGroupDialog("Delete Group");
            }
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

    $.contextMenu({
        selector: '.file-child',
        callback: function (key, options) {
            if (key == "viewAcc") {
                prepareRedirectAcco(_urlViewAccount);
            } else if (key == "editAcc") {
                prepareRedirectAcco(_urlEditAccount);
            } else if (key == "delAcc") {
                $scope.delete.uuid = $(this).find(".account-uuid").html();
                $scope.TriggerDeleteAccountDialog("Delete Account");
            } else if (key == "copyUrl") {
                ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.URL }, _CONTENT_COPY, function () {
                    notifiSuccess(_NOTIFI_CLIPBOARD_CAPTION, _COPY_URL_MSG);
                });
            } else if (key == "copyPasswrd") {
                ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.PASSWORD }, _CONTENT_COPY, function () {
                    notifiSuccess(_NOTIFI_CLIPBOARD_CAPTION, _COPY_PASSWORD_MSG);
                });
            } else if (key == "copyCuser") {
                ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.USERNAME }, _CONTENT_COPY, function () {
                    notifiSuccess(_NOTIFI_CLIPBOARD_CAPTION, _COPY_USERNAME_MSG);
                });
            } else if (key == "RedirectUrl") {
                ajaxPostOnly({ uuid: getUuid(), attribute: _CONTEXT_ATTRIBUTE.USERNAME }, _CONTENT_COPY, function (url) {
                    if (url.toLowerCase().indexOf(_PREFIX) == -1) {
                        window.open(_PREFIX + url, '_blank');
                    } else {
                        window.open(url, '_blank');
                    }
                });
            }
        },

        items: {
            "RedirectUrl": {
                name: USER_CONTEXT_NAME_OBJ.NAME_REDIRECT_URL,
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
                name: USER_CONTEXT_NAME_OBJ.NAME_COPY_USERNAME,
            },
            "copyPasswrd": {
                name: USER_CONTEXT_NAME_OBJ.NAME_COPY_PASSWORD,
            },
            "copyUrl": {
                name: USER_CONTEXT_NAME_OBJ.NAME_COPY_URL,
            },
        }
    });

    var settingPGenerator = function () {
        var pwdLenth = _DEFAULT_PWD_LENGTH;
        var requiredPassword = pwdLength();

        if (requiredPassword > pwdLenth) {
            pwdLenth = requiredPassword;
        }
        $("#genPassword").pGenerator({
            'bind': 'click',
            'passwordElement': "#passwd",
            'displayElement': '#my-display-element',
            'passwordLength': pwdLenth,
            'uppercase': true,
            'lowercase': true,
            'numbers': true,
            'specialChars': true,
            'onPasswordGenerated': function (generatedPassword) {
                $scope.Reveal("#passwd");
                setTimeout(function () {
                    $scope.Hide("#passwd");
                }, _TIME_SHOWPASSWORD);
                $('#passwd').change();
            }
        });
    }
    settingPGenerator();

    var addApprovedClass = function (id) {
        $(id).addClass("black");
        $(id + " span").addClass("tick-pass");
    };

    var removeApprovedClass = function (id) {
        $(id).removeClass("black");
        $(id + " span").removeClass("tick-pass");
    }


    var selectAccountSearch = function () {
        var isSearchShow = !$(".search-item").is(":hidden");
        if (isSearchShow) {
            $("#account-search").click();
        }
    }
});

var isLowercase = function () {
    return $("#isLowercase").prop('checked');
}
var isUppercase = function () {
    return $("#isUppercase").prop('checked');
}
var isDigit = function () {
    return $("#isDigit").prop('checked');
}
var isSymbol = function () {
    return $("#isSymbol").prop('checked');
}
var pwdLength = function () {
    return $("#passwrdMinLenth").val();
}

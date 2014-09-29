var treeStructure = { groupName: "", children: [{ uuid: "79873249827346", title: "hello1", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "68678676867", title: "hello2", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "123123131", title: "hello3", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [{ groupName: "Sites", children: [{ uuid: "79873249827346", title: "hello4", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "79873249827346", title: "hello4", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "79873249827346", title: "hello4.1", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [{ groupName: "siteSub1", children: [{ uuid: "79873249827346", title: "hello5", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [{ groupName: "Sitessub2.1", children: [{ uuid: "79873249827346", title: "hello6", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [] }, { groupName: "subsub2.2", children: [], groups: [] }] }] }, { groupName: "sub2", children: [], groups: [] }] };
var NO_GROUP_NAME = "Empty Group";
var _backspace_keycode = 8;
var _urlErrorPage404 = "error-page.html";
var _urlErrorPage500 = "error-page.html?code=500";
var _urlDialogTemplate = "dialog-template.html";

var mainApp = angular.module("mainApp", []);

function mainCtr($scope, $http, $q, $location) {
    $scope.tree = treeStructure;
    $scope.childIndex = -1;
    $scope.breadcrumbs = [];
    $scope.cacheDialogTemplate = "";


    $scope.AssessName = function (str) {
        if (str.length == 0) {
            return NO_GROUP_NAME;
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

    $scope.SetActive = function (index) {
        $scope.childIndex = index;
    }

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
        ajaxPost($("#settingForm"), false, function () {
            closeSilder();
            $.Notify({ style: { background: '#1ba1e2', color: 'white' }, caption: 'Setting', content: "Saved Successfully" });
        });
    };
    //$scope.CheckIfLastBreadcrumb = function (breadcrumb) {
    //    console.log("I was called");
    //    var inactiveClass = "unavailable";
    //    if (breadcrumb.groups.length == 0) {
    //        return inactiveClass;
    //    }
    //    return null;
    //};

    $scope.TriggerSlider = function () {
        $(".slide-right").show();
        $(".slide-right-wrapper").animate({ 'opacity': 0.3, 'filter': 'alpha(opacity=30)' });
        $(".slide-right-panel").animate({ 'margin-right': 0, 'opacity': 1, 'filter': 'alpha(opacity=100)' });
    };

    $scope.CloseSlider = function () {
        closeSilder();
    };

    $scope.TriggerDialog = function ($title) {
        if ($scope.dialogTemplate) {
            triggerDialog($title, $scope.cacheDialogTemplate);
        } else {
            $http.get(_urlDialogTemplate).success(function ($content) {
                $scope.cacheDialogTemplate = $content;
                triggerDialog($title, $content);
            })
            .error(function () {
                window.location.href = _urlErrorPage500;
            });
        }
    };

    var addParentToEachChild = function (obj) {
        for (var a = 0; a < obj.children.length; a++) {
            obj.children[a].parent = obj;
        }
    };

    var setGroupandChildren = function (scope, obj) {
        scope.groups = obj.groups;
        scope.children = obj.children;
    };

    var resetChildIndex = function () {
        $scope.childIndex = -1;
    };

    var closeSilder = function () {
        $(".slide-right-wrapper").animate({ 'opacity': 0 });
        $(".slide-right-panel").animate({ 'margin-right': '-320px', 'opacity': -0.5, 'filter': 'alpha(opacity=-150)' }, function () {
            $(".slide-right").hide();
        });
    };

};




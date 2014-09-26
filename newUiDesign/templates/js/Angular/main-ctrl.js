var treeStructure = { groupName: "", children: [{ uuid: "79873249827346", title: "hello1", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "68678676867", title: "hello2", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "123123131", title: "hello3", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [{ groupName: "Sites", children: [{ uuid: "79873249827346", title: "hello4", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "79873249827346", title: "hello4", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }, { uuid: "79873249827346", title: "hello4.1", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [{ groupName: "siteSub1", children: [{ uuid: "79873249827346", title: "hello5", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [{ groupName: "Sitessub2.1", children: [{ uuid: "79873249827346", title: "hello6", user: "username", passwd: "1234", notes: "this is a note", last_mod: 0, url: "google.com" }], groups: [] }, { groupName: "subsub2.2", children: [], groups: [] }] }] }, { groupName: "sub2", children: [], groups: [] }] };
var NO_GROUP_NAME = "Empty Group";
var _backspace_keycode = 8;

var mainApp = angular.module("mainApp", []);

function mainCtr($scope, $location) {
    $scope.tree = treeStructure;
    $scope.childIndex = -1;
    $scope.breadcrumbs = [];

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

    //$scope.CheckIfLastBreadcrumb = function (breadcrumb) {
    //    console.log("I was called");
    //    var inactiveClass = "unavailable";
    //    if (breadcrumb.groups.length == 0) {
    //        return inactiveClass;
    //    }
    //    return null;
    //};

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
    }


    console.log("Run ng js");
};


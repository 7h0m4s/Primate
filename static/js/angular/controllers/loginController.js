var _urlLogin = "login.html";
var _urlGetFilePath = "/get-filepath";
var _urlDashboard = "/dashboard";
var loginApp = angular.module("loginApp", ['ngStorage']);

loginApp.directive('passwordMatch', [function () {
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
}]);

loginApp.controller('loginController', function ($scope, $localStorage) {
    $scope.SubmitLoginForm = function (isValid) {
        if (isValid) {
            ajaxPost($("#loginForm"), true, null, function (msg) {
                console.log(msg);
                if (msg) {
                    $(".login-error").html(msg);
                    $(".login-error").slideDown("fast");
                } else {
                    redirectToMainPage();
                }
            },
                function () {
                    redirectToErroPage505();
                });
        } else {
            if ($scope.loginForm.Password.$error.required) {
                $(".login-validate").eq(0).slideDown("fast");
            }
            if ($scope.loginForm.DatabaseFile.$error.required) {
                $(".login-validate").eq(1).slideDown("fast");
            }
        }
    };

    $scope.OpenFileDialog = function () {
        ajaxGetMethod(true, _urlGetFilePath, {}, function (content) {
            setDatabaseInputModified();
            setDatabaseInputNotRequired();
            $("#databaseFile").val(content);
        }, function () {
            redirectToErroPage505();
        });
    };

    $scope.$watch('loginForm.Password.$error.required', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            if (newValue && $scope.loginForm.Password.$dirty) {
                $(".login-validate").eq(0).slideDown("fast");
            }
            else {
                $(".login-validate").eq(0).slideUp("fast");
            }
        }
    });

    $scope.$watch('loginForm.DatabaseFile.$error.required', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            if (newValue && $scope.loginForm.DatabaseFile.$dirty) {
                $(".login-validate").eq(1).slideDown("fast");
            }
            else {
                $(".login-validate").eq(1).slideUp("fast");
            }
        }
    });

    $scope.SubmitNewDbForm = function (isValid) {
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#newDBForm"), true, null, function () {
                redirect(_urlDashboard);
            },
            function () {
                redirectToErroPage505();
            });
        } else {
            if ($scope.newDBForm.DatabaseFile.$error.required) {
                $(".login-validate").eq(0).slideDown("fast");
            }
            if ($scope.newDBForm.Password.$error.required) {
                $(".login-validate").eq(1).slideDown("fast");
            }
        }
    };

    $scope.$watch('newDBForm.DatabaseFile.$error.required', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            if (newValue && $scope.newDBForm.DatabaseFile.$dirty) {
                $(".login-validate").eq(0).slideDown("fast");
            }
            else {
                $(".login-validate").eq(0).slideUp("fast");
            }
        }
    });

    $scope.$watch('newDBForm.Password.$error.required', function (newValue, oldvalue) {
        if (newValue != oldvalue) {
            if (newValue && $scope.newDBForm.Password.$dirty) {
                $(".login-validate").eq(1).slideDown("fast");
            }
            else {
                $(".login-validate").eq(1).slideUp("fast");
            }
        }
    });

    var setDatabaseInputModified = function () {
        $scope.loginForm.DatabaseFile.$dirty = true;
    }

    var setDatabaseInputNotRequired = function () {
        $scope.loginForm.DatabaseFile.$setValidity('required', true);
    }
});

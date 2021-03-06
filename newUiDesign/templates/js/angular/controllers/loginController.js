﻿var _urlLoginRedirect = "main.html";
var _urlLogin = "login.html";
var loginApp = angular.module("loginApp", []);

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

loginApp.controller('loginController', function ($scope) {
    $scope.SubmitLoginForm = function (isValid) {
        if (isValid) {
            submitAnimatel();
            ajaxPost($("#loginForm"), true, null, function () {
                window.location.href = _urlLoginRedirect;
            },
                function () {
                    $(".login-error").slideDown("fast");
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
                window.location.href = _urlLogin;
            },
            function () {
                redirectToErroPage();
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
});

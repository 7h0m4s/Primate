var _urlLogin = "login.html";
var _urlGetFilePath = "/get-filepath";
var _urlDashboard = "/dashboard";
var loginApp = angular.module("loginApp", ['ngStorage']);
var _REQUEST_LOCK = false;
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

loginApp.controller('loginController', function ($scope, $compile, $http) {
    var lockFileDialog = false;

    $scope.SubmitLoginForm = function (isValid) {
        if (isValid) {
            ajaxPost($("#loginForm"), true, null, function (msg) {
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
    $scope.OpenSetFileDialog = function () {
        if (!lockFileDialog) {
            lockFileDialog = true;
            ajaxGetMethod(true, _urlSetFilePath, {}, function (content) {
                if (content.length != 0) {
                    setDatabaseInputModified();
                    setDatabaseInputNotRequired();
                    $("#databaseFile").val(content);
                }
                lockFileDialog = false;
            }, function () {
                redirectToErroPage505();
            });
        }
    }
    $scope.OpenFileDialog = function () {
        if (!lockFileDialog) {
            lockFileDialog = true;
            ajaxGetMethod(true, _urlGetFilePath, {}, function (content) {
                if (content.length != 0) {
                    setLoginDatabaseInputModified();
                    setLoginDatabaseInputNotRequired();
                    $("#databaseFile").val(content);
                }
                lockFileDialog = false;
            }, function () {
                redirectToErroPage505();
            });
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
            if (_REQUEST_LOCK) {
                return;
            }
            _REQUEST_LOCK = true;
            ajaxPost($("#newDBForm"), true, null, function (msg) {
                if (!msg) {
                    redirect(_urlDashboard);
                    _REQUEST_LOCK = false;
                } else {
                    $(".symbol-validate").html(msg).slideDown("fast");
                    _REQUEST_LOCK = false;
                }
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
            _REQUEST_LOCK = false;
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

    $scope.Reveal = function (id) {
        $(id).attr("type", "text");
    };
    $scope.Hide = function (id) {
        $(id).attr("type", "password");
    };

    $scope.TriggerShutdownDialog = function ($title) {
        $http.get(_urlShutdownTemplate).success(function ($content) {
            var $compileContent = $compile($content)($scope)[0];
            return triggerDialog($title, $compileContent);
        })
        .error(function ($content, status) {
            redirectToErroPage505();
        });
    };

    var setDatabaseInputModified = function () {
        $scope.newDBForm.DatabaseFile.$dirty = true;
    }

    var setDatabaseInputNotRequired = function () {
        $scope.newDBForm.DatabaseFile.$setValidity('required', true);
    }

    var setLoginDatabaseInputModified = function () {
        $scope.loginForm.DatabaseFile.$dirty = true;
    }

    var setLoginDatabaseInputNotRequired = function () {
        $scope.loginForm.DatabaseFile.$setValidity('required', true);
    }
});

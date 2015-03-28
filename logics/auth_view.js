angular.module('adaperio.controllers').controller('controllers.AuthView',
    [
        '$scope',
        '$rootScope',
        '$routeParams',
        '$window',
        '$location',
        'services.Api',
        'services.AdminApi',

        function($scope,$rootScope,$routeParams,$window,$location,api,adminApi){
            try {
                $window.yaCounter24002680.reachGoal('AUTH_PAGE');
            }catch(e){
                console.log('Can not reach goal: ' +e);
            }

            $scope.errorMsg = '';

            $scope.login = function(username,password){

                var loginData = {
                    username: username,
                    password: password
                };

                adminApi.doLogin(loginData,function(data){
                    $scope.errorMsg = '';

                    $window.sessionStorage.token = data.token;

                    // move to clients
                    $location.path('/admin');
                },function(errData){
                    $scope.errorMsg = 'Не удалось пройти аутентификацию. Попробуйте снова';
                });
            };
        }
    ]
);

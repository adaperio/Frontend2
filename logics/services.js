
// This service is used as a HTTP/HTTPS interceptor to inject Auth header
angular.module('adaperio.services').factory('authInterceptor',
    function ($rootScope, $q, $window) {
        return {
            request: function (config) {
                config.headers = config.headers || {};

                if($window.sessionStorage.token) {
                    config.headers.Authorization = 'Bearer ' + $window.sessionStorage.token;
                }

                return config;
            },

            response: function (response) {
                if(response.status === 401) {
                    // TODO: handle the case where the user is not authenticated
                }
                return response || $q.when(response);
            }
        };
    }
);

// these methods require authentication
angular.module('adaperio.services').factory('services.AdminApi',[
    '$q',
    '$http',
    'services.transformer.ApiTransformer',
    'services.Helpers',

    function ($q, $http, apiTransformer, helpers ){
        return {
            doLogin: function(loginData,cb,cbError){
                $http({
                    method:"POST",
                    data: loginData,
                    url: "http://api.adaperio.ru:8080/authenticate"
                })
                    .success(function (data, status, headers, config) {
                        cb(data);
                    })
                    .error(function (data, status, headers, config) {
                        cbError(data);
                    });
            },

            getCar: function(num,cb){
                var url = helpers.convertNumberToUrlGetCar(num);

                console.log('Asking backend for link: ' + url);

                $http({
                    method:"GET",
                    data: '',
                    url: url
                })
                    .success(function (data, status, headers, config) {
                        console.log('Success: ' + status);
                        cb(data);
                    })
                    .error(function (data, status, headers, config) {
                        console.log('Err: ' + status);
                        cb(null);
                    });
            },

            getCarByVin: function(vin,cb){
                var url = helpers.convertVinToUrlGetCar(vin);

                console.log('Asking backend for link: ' + url);

                $http({
                    method:"GET",
                    data: '',
                    url: url
                })
                    .success(function (data, status, headers, config) {
                        console.log('Success: ' + status);
                        cb(data);
                    })
                    .error(function (data, status, headers, config) {
                        console.log('Err: ' + status);
                        cb(null);
                    });
            },

            makeLinkForCarByVin: function(vin,cb){
                var url = helpers.convertVinToUrlMakeLink(vin);

                console.log('Asking backend for link: ' + url);

                $http({
                    method:"POST",
                    data: '',
                    url: url
                })
                    .success(function (data, status, headers, config) {
                        console.log('Success: ' + status);
                        cb(data);
                    })
                    .error(function (data, status, headers, config) {
                        console.log('Err: ' + status);
                        cb(null);
                    });
            },

            makeLinkForCar: function(num,cb){
                var url = helpers.convertNumToUrlMakeLink(num);

                console.log('Asking backend for link: ' + url);

                $http({
                    method:"POST",
                    data: '',
                    url: url
                })
                    .success(function (data, status, headers, config) {
                        console.log('Success: ' + status);
                        cb(data);
                    })
                    .error(function (data, status, headers, config) {
                        console.log('Err: ' + status);
                        cb(null);
                    });
            }

        };
    }
]);

angular.module('adaperio.services').factory('services.Api',[
    '$q',
    '$http',
    'services.transformer.ApiTransformer',
    'services.Helpers',

    function ($q, $http, apiTransformer, helpers ){
        return {
            checkIfCarExists: function(num,cb){
                var url = helpers.convertNumberToUrlCheckCar(num);

                $http({
                    method:"GET",
                    data: '',
                    url: url
                })
                .success(function (data, status, headers, config) {
                    cb(null,true,data);
                })
                .error(function (data, status, headers, config) {
                    cb(new Error("Check can not be completed"),false);
                });
            },

            createNewOrder: function(userEmail,num,vin,cb){
                $http({
                    method:"POST",
                    data: { num:num,
                            email:userEmail,
                            vin:vin
                          },
                    url: "http://api.adaperio.ru:8080/v1/orders"
                })
                    .success(function (data, status, headers, config) {
                        cb(null,
                            data.id,
                            data.sig);
                    })
                    .error(function (data, status, headers, config) {
                        cb(new Error("Can not create new order"));
                    });
            },

            getOrderResult: function(sum,invId,sig,cb){
                var urlMethod = "http://api.adaperio.ru:8080/v1/cars_by_order/" + invId + "?signature=" + sig;

                $http({
                    method:"GET",
                    url: urlMethod
                })
                    .success(function (data, status, headers, config) {
                        cb(null,data);
                    })
                    .error(function (data, status, headers, config) {
                        cb(new Error("Can not return order result"));
                    });
            },

            subscribeForNews: function(userEmail,num,cb){
			 var url = "http://api.adaperio.ru:8080/v1/subscribeForCar/" + num + "?email=" + userEmail;

                $http({
                    method:"POST",
                    data: {
                          },
                    url: url
                })
                    .success(function (data, status, headers, config) {
				    cb(null,data.status);
                    })
                    .error(function (data, status, headers, config) {
                        cb(new Error("Can not subscribe for news"));
                    });
            },

            showSpinner: function(enable,htmlElementId){
                var target = document.getElementById(htmlElementId);

                if(target==='undefined' || !target){
                    return;
                }

                if (!enable) {
                    target.style.display = 'none';
                } else {
                    target.style.display = '';
                }
            }

        };
    }
]);

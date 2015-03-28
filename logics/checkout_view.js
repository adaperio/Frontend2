
angular.module('adaperio.controllers')
    .directive('focus', function($timeout, $parse) {
        return {
            restrict: 'A',

            link: function(scope, element, attrs) {
                scope.$watch(attrs.focus, function(newValue, oldValue) {
                    if (newValue) { element[0].focus(); }
                });

                element.bind("blur", function(e) {
                    $timeout(function() {
                        scope.$apply(attrs.focus + "=false");
                    }, 0);
                });

                element.bind("focus", function(e) {
                    $timeout(function() {
                        scope.$apply(attrs.focus + "=true");
                    }, 0);
                });
            }
        };
    });

angular.module('adaperio.controllers').controller('controllers.CheckoutView',
    [
        '$scope',
        '$rootScope',
        '$routeParams',
        '$window',
        '$location',
        '$timeout',
        'services.Api',
        'services.ToCheckout',

        function($scope,$rootScope,$routeParams,$window,$location,$timeout,api,toCheckout){
            // by default - we do not show Vkontakte group
            $scope.dataLoaded = false;

            $scope.carsUnsorted = [];
            $scope.vinsMap = [];

            /*
            {
                model: '',
                vin: '',
                body: '',
                year: ''
            };*/

            $scope.somethingFound = false;
            $scope.readyToFollow  = true;
            $scope.userId = 0;
            $scope.sid = 0;
            $scope.sig = 0;

            $scope.numberAsked = '';
            $scope.numberAskedLatin = '';

            $scope.focusInput = true;

            // 
            $scope.processCarData = function(data){
                var car = {
                    model: data.carModel,
                    vin: data.vin,
                    body: data.body,
                    year: data.year,
                    nums: []
                };

                car.nums.push(data.num);

                if(typeof(data.autoNomerPics)!=='undefined'){
                    $scope.autoNomerPics = data.autoNomerPics.slice(0);
                }

                if(data.milleageFound){
                    $scope.somethingFound = true;
                    $scope.milleageFound = true;
                }else{
                    $scope.milleageFound = false;
                }

                if(data.accidentFound){
                    $scope.somethingFound = true;
                    $scope.accidentFound = true;
                }else{
                    $scope.accidentFound = false;
                }

                if(data.picsFound){
                    $scope.somethingFound = true;
                    $scope.photoFound = true;
                }else{
                    $scope.photoFound = false;
                }

                if(data.taxiFound){
                    $scope.somethingFound = true;
                    $scope.taxiFound = true;
                }else{
                    $scope.taxiFound = false;
                }

                if((typeof(data.carModel)!=='undefined') && data.carModel.length){
                    $scope.somethingFound = true;
                }

                $scope.carsUnsorted.push(car);
            };

            $scope.errorCreatingOrder = function(){
                $window.alert('Произошла ошибка. Пожалуйста, попробуйте еще раз');
                $location.path('/main');
            };

            $scope.convertToLat = function(ch){
                var c =
                    [
                        {f:'а',
                            t:'A'},

                        {f:'в',
                            t:'B'},

                        {f:'е',
                            t:'E'},

                        {f:'к',
                            t:'K'},

                        {f:'м',
                            t:'M'},

                        {f:'н',
                            t:'H'},

                        {f:'о',
                            t:'O'},

                        {f:'р',
                            t:'P'},

                        {f:'с',
                            t:'C'},

                        {f:'т',
                            t:'T'},

                        {f:'у',
                            t:'Y'},

                        {f:'х',
                            t:'X'}
                    ];

                for(var i=0; i< c.length; ++i){
                    if(ch===c[i].f){
                        console.log('Convert ' + ch + ' to ' + c[i].t);
                        return c[i].t;
                    }
                }

                return ch;
            };

            $scope.convertCyrilToLatin = function(numCyr){
                console.log('Convert number: ' + numCyr);
                numCyr = numCyr.toLowerCase();

                var numAfter = '';
                for(var i=0; i<numCyr.length; ++i){
                    numAfter = numAfter + $scope.convertToLat(numCyr[i]);
                }

                numAfter = numAfter.toUpperCase();

                console.log('Result: ' + numAfter);
                return numAfter;
            };

            $scope.checkout = function(email,num,vin){
                console.log('Checkout button clicked ' + email);
                console.log('-->Vin: '+ vin);
                console.log('-->Num: '+ num);

                if(typeof(email)==='undefined' || !email.length){
                    $window.alert('Пожалуйста введите ваш e-mail');

                    // TODO: set focus
                    //var target = document.getElementById('email_input');
                    //target.focus();

                    return;
                }

                var invId = '';
                var signature = '';

                var newWindow = $window.open('');

                async.series(
                    [
                        // 1 - create new order
                        function(callback){
                            console.log('Creating new order');

                            api.createNewOrder(email,num,vin,function(err,ii,sig){
                                if(err){
                                    return callback(err);
                                }

                                invId = ii;
                                signature = sig;

                                console.log('Order is OK');
                                callback(null);
                            });
                        },
                    ],
                    function(err,result){
                        console.log('Inv id: ' + invId);
                        console.log('Signature: ' + signature);

                        if(err){
                            return $scope.errorCreatingOrder();
                        }else{
                            var robokassaPath = 'https://auth.robokassa.ru/Merchant/Index.aspx' +
                                '?MrchLogin=Adaperio&' +
                                'OutSum=100.000000&' +
                                'InvId=' + invId + '&' +
                                'Desc=AdaperioCarCheck&' +
                                'SignatureValue=' + signature + '&' +
                                'Email=' + email + '&' +
                                'Culture=ru';

                            $window.yaCounter24002680.reachGoal('SUCCESS_PAGE');

                            newWindow.location = robokassaPath;
                        }
                    });
            };

            $scope.moveBack = function(){
                console.log('Moving back: search->main');
                $location.path('/main');
            };

            $scope.subscribeEmail = function(email){
                console.log('Subscribe with email: ' + email);
                if(typeof(email)==='undefined' || !email){
                    $window.alert('Введен неверный e-mail!');
                    return;
                }

                $window.yaCounter24002680.reachGoal('SUBSCRIBE_TRIGGERED');

                api.subscribeForNews(email,$scope.numberAsked,function(err,result){
                    if(result==='OK'){
                        $window.yaCounter24002680.reachGoal('EMAIL_ENTERED');

                        $window.alert('Вы успешно подписались на новости об автомобиле ' + $scope.numberAsked);
                        // move to main screen
                        //$scope.moveBack();
                    }else{
                        $window.alert('К сожалению, подписаться не удалось. Попробуйте еще раз' + $scope.numberAsked);
                    }
                });
            };

            // This is called when all data downloaded
            $scope.continueMain = function() {
                console.log('Cars found: ' + toCheckout.getSearchData().length);

                // process all cars
                $scope.somethingFound = false;
                $scope.carsUnsorted = [];

                for (var i = 0; i < toCheckout.getSearchData().length; ++i) {
                    // will add car to $scope.cars
                    $scope.processCarData(toCheckout.getSearchData()[i]);
                }

                // will copy cars from carsUnsorted to cars
                $scope.sortCarsByVin();

                $window.scrollTo(0, 0);

                // Update analytics
                if($scope.somethingFound){
                    $window.yaCounter24002680.reachGoal('GOTO_CHECKOUT');
                }
            };

            $scope.sortCarsByVin = function(){
                // sort by VIN
                $scope.carsUnsorted.sort(function(a,b){
                    if(typeof(a.vin)!=='undefined' && a.vin.length && typeof(b.vin)!=='undefined' && b.vin.length){
                        if(a.vin > b.vin){
                            return 1;
                        }else if(a.vin < b.vin){
                            return -1;
                        }
                    }else if(typeof(a.body)!=='undefined' && a.body.length && typeof(b.body)!=='undefined' && b.body.length){
                        // sort by BODY if no VIN
                        if(a.body > b.body){
                            return 1;
                        }else if(a.body < b.body){
                            return -1;
                        }
                    }
                    return 0;
                });

                var tmpMap = {};
                var vinsArr = [];

                for(var i=0; i<$scope.carsUnsorted.length; ++i){
                    var vob = $scope.getVinOrBody($scope.carsUnsorted[i]);

                    tmpMap[vob] = 1;
                }

                for(var vin in tmpMap){
                    var tuple = {
                        cars: []
                    };

                    // get all cars with such VIN
                    for(var i=0; i<$scope.carsUnsorted.length; ++i) {
                        var vob = $scope.getVinOrBody($scope.carsUnsorted[i]);

                        // do not show additinal records for that car
                        //var isSameNum = ($scope.carsUnsorted[i].num===$scope.numberAsked);
                        var isSameNum = true;
                        if(vob===vin && isSameNum) {
                            console.log('->PUSH');
                            console.log($scope.carsUnsorted[i]);

                            tuple.cars.push($scope.carsUnsorted[i]);

                            //tuple.cars[tuple.cars.length-1].numLatin = $scope.convertCyrilToLatin($scope.carsUnsorted[i].num);
                        }
                    }

                    vinsArr.push(tuple);
                }

                $scope.fillVinsMap(vinsArr);
            };

            $scope.fillVinsMap = function(arr){
                for(var i=0; i<arr.length; ++i){
                    var tuple = arr[i];

                    var res = $scope.compressTuple(tuple);

                    $scope.vinsMap.push(res);
                }
            };

            $scope.compressTuple = function(tuple){
                var out = {
                    cars: []
                };

                var tmp = tuple.cars[0];
                for(var i=1; i<tuple.cars.length; ++i){
                    tmp.nums.push(tuple.cars[i].nums[0]);
                }

                out.cars.push(tmp);
                return out;
            };

            $scope.getVinOrBody = function(car){
                if(typeof(car.vin)!=='undefined' && car.vin.length){
                    return car.vin;
                }

                if(typeof(car.body)!=='undefined' && car.body.length) {
                    return car.body;
                }

                return '';
            };

            // Start:
            // 1 - Parse URL
            var match1 = $location.path().match(/\/search\/(.*)/);
            if(match1 && match1.length){
                $scope.numberAsked = match1[1];
                $scope.numberAskedLatin = $scope.convertCyrilToLatin($scope.numberAsked);
            }

            if(!$scope.numberAsked.length){
                console.log('Move to main...');
                $window.location.href = 'index.html';
                return;
            }

            console.log('Number asked: ' + $scope.numberAsked);

            // 2 - load/show data
            if(!toCheckout.getFromSearchView()){

                // load data again! Originally this is done in 'search view'
                api.checkIfCarExists($scope.numberAsked,function(err,result,data){
                    api.showSpinner(false,'webSiteLoader');

                    if(err){
                        //return $scope.errorCreatingOrder();
                        console.log('Error: ' + err);
                    }

                    if(result){
                        console.log('Information for car #' + $scope.numberAsked + ' found');
                        toCheckout.setSearchData(data);
                    }else{
                        var dataEmpty = {};
                        dataEmpty.number = $scope.numberAsked;
                        dataEmpty.data = null;
                        dataEmpty.isFromSearchView = false;
                        toCheckout.setSearchData(dataEmpty);
                    }

                    $scope.dataLoaded = true;
                    $scope.continueMain();
                });
            }else{
                toCheckout.setFromSearchView(false);

                $scope.dataLoaded = true;
                $scope.continueMain();
            }
        }
    ]
);

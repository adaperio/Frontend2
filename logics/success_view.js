angular.module('adaperio.controllers').controller('controllers.SuccessView',
    [
        '$scope',
        '$rootScope',
        '$routeParams',
        '$window',
        '$location',
        'services.Api',
        'services.AdminApi',

        function ($scope, $rootScope, $routeParams, $window, $location, api, adminApi) {
            $scope.clearAll = function(){
                $scope.cars = [];

                // received by num for all cars at once
                $scope.errMessage = '';

                $scope.adminEnabled = false;
                $scope.dataAvailable = false;

                $scope.makeLinkAvailable = true;
            };

            $scope.convertOgrcodeToString = function (ogrkod) {
                if (ogrkod === 3) {
                    return 'Запрет на регистрационные действия и прохождение ГТО';
                }

                if (ogrkod === 2) {
                    return 'Запрет на регистрационные действия';
                }

                return 'Запрет на регистрационные действия';
            };

            // Admin view
            $scope.getCar = function(licenseNumber,vinAsked){
                var gotInput = false;

                if(typeof(licenseNumber)!=='undefined' && licenseNumber.length){
                    gotInput = true;
                }
                if(typeof(vinAsked)!=='undefined' && vinAsked.length){
                    gotInput = true;
                }

                if(!gotInput){
                    $scope.errMessage = 'Пожалуйста введите данные';
                    return;
                }

                $scope.clearAll();
                $scope.adminEnabled = true;  // clearAll side-effect ))

                api.showSpinner(true, 'webSiteLoader');

                // check if we have data for your car
                if(typeof(vinAsked)!=='undefined' && vinAsked && vinAsked.length) {
                    console.log('Asking for car data by VIN: ' + vinAsked);
                    adminApi.getCarByVin(vinAsked,function(result){
                        $scope.getCarCont(result);
                    });
                }else {
                    adminApi.getCar(licenseNumber, function (result) {
                        $scope.getCarCont(result);
                    });
                }
            };

            $scope.makeLink = function(licenseNumber,vinAsked){
                var gotInput = false;

                if(typeof(licenseNumber)!=='undefined' && licenseNumber.length){
                    gotInput = true;
                }
                if(typeof(vinAsked)!=='undefined' && vinAsked.length){
                    gotInput = true;
                }

                if(!gotInput){
                    $scope.errMessage = 'Пожалуйста введите данные';
                    return;
                }

                if(typeof(vinAsked)!=='undefined' && vinAsked && vinAsked.length) {
                    console.log('Making link for car data by VIN: ' + vinAsked);
                    adminApi.makeLinkForCarByVin(vinAsked,function(result){
                        $scope.processLinkResult(result);
                    });
                }else {
                    adminApi.makeLinkForCar(licenseNumber, function (result) {
                        $scope.processLinkResult(result);
                    });
                }
            };

            $scope.processLinkResult = function(result){
                if(typeof(result.id)==='undefined' || !result.id.length){
                    return;
                }

                var url = 'http://adaperio.ru/engine.html#/success?InvId=' + result.id;
                $scope.errMessage = url;
            };

            $scope.getCarCont = function(result){
                if (result) {
                    // success!
                    $scope.processData(result);
                    $scope.dataAvailable = true;
                } else {
                    // show error
                    $scope.errMessage = 'Информация не найдена. Попробуйте еще раз';
                }

                api.showSpinner(false, 'webSiteLoader');
            };

            //OutSum
            //InvId=nInvId
            //SignatureValue=sSignatureValue&
            //Culture=sCulture
            //console.log('QUERY STRING PARAMS: ');
            //console.log($location.search());

            console.log($location.url());

            var sum = $location.search().OutSum;
            var invId = $location.search().InvId;
            var sig = $location.search().SignatureValue;

            console.log('SUM: ' + sum);
            console.log('INV ID: ' + invId);
            console.log('SIG: ' + sig);

            $scope.processData = function(carsData){
                $scope.cars = [];
                for(var i=0; i<carsData.cars.length; ++i) {
                    $scope.processDataCar(carsData.cars[i]);
                }
            };

            $scope.processDataCar = function(data){

                var car = {
                    num:'',
                    body: '',
                    ownerCount: 0,
                    bodyColor: '',
                    engineDisp: 0,
                    engineHp: 0,

                    year: '',
                    milleage: 0,
                    milleageArr: [],
                    milleageMsg: 'Не установлен',
                    milleageCheckDate: 'Не установлена',
                    fakeMilleageFound: false,
                    badMilleageFound: false,

                    autoNomerPics: [],

                    taxiMake: null,
                    taxiOwner: null,
                    taxiStarted: 'Не известно',
                    taxiEnded: 'Не известно',

                    model: 'Не известно',
                    gotGibddWanted: false,
                    gibddWanted: false,
                    wantedArr: [],

                    reestrGotResult: false,
                    reestrResult: false,

                    gotGibddRestricted: false,
                    gibddRestricted: false,
                    restrictedArr: [],

                    receivedLinks: [],
                    receivedPhotos: [],
                    receivedDtps: [],

                    auctions: [],
                    customs: {},
                    customsFound: false
                };

                api.showSpinner(false, 'webSiteLoader');

                var links = data.docs.slice();
                var kms = data.milleage;
                var taxiData = data.taxiData;

                if (typeof(data.num) !== 'undefined' && data.num.length) {
                    car.num = data.num;
                }

                if (typeof(data.vin) !== 'undefined' && data.vin.length) {
                    car.vin = data.vin;
                }

                if (typeof(data.body) !== 'undefined' && data.body.length) {
                    car.body = data.body;
                }

                if (typeof(data.year) !== 'undefined' && data.year.length) {
                    car.year = data.year;
                }

                car.model = data.carModel;

                // split into 2 arrays: docs + pics
                console.log('Parsing links...');
                for (var i = 0; i < links.length; i++) {

                    if (links[i].link.indexOf('jpg?') !== -1 || links[i].link.indexOf('png?') !== -1) {
                        car.receivedPhotos.push(links[i]);
                    } else {
                        car.receivedLinks.push(links[i]);
                    }
                }

                console.log('Parsing dtps');
                if((typeof(data.dtps)!=='undefined') && (data.dtps.length)){
                    console.log('DTPS found!');

                    car.receivedDtps = data.dtps.slice();
                }

                if(typeof(data.ownerCount)!=='undefined') {
                    car.ownerCount = data.ownerCount;
                }
                if(typeof(data.bodyColor)!=='undefined') {
                    car.bodyColor  = data.bodyColor;
                }
                if(typeof(data.engineDisp)!=='undefined') {
                    car.engineDisp   = data.engineDisp;
                }
                if(typeof(data.engineHp)!=='undefined') {
                    car.engineHp   = data.engineHp;
                }

                if(typeof(data.reestrGotResult)!=='undefined') {
                    car.reestrGotResult = data.reestrGotResult;
                }
                if(typeof(data.reestrResult)!=='undefined') {
                    car.reestrResult = data.reestrResult;
                }

                console.log('Parsing taxi data...');
                if (typeof(taxiData) !== 'undefined' && taxiData.length) {
                    car.taxiMake = taxiData[0].name;
                    car.taxiOwner = taxiData[0].owner;
                    car.taxiStarted = taxiData[0].started;
                    car.taxiEnded = 'Настоящее время';

                    if (typeof(taxiData[0].end) !== 'undefined' && taxiData[0].end.length) {
                        car.taxiEnded = taxiData[0].end;
                    }
                }

                // gibdd data
                console.log('Parsing gibdd data...');
                if (typeof(data.gibddWanted) !== 'undefined') {
                    car.gotGibddWanted = true;
                    car.gibddWanted = data.gibddWanted;

                    if (data.gibddWanted) {
                        car.wantedArr = data.wantedArr.slice();
                    }
                }

                if (typeof(data.gibddRestricted) !== 'undefined') {
                    car.gotGibddRestricted = true;
                    car.gibddRestricted = data.gibddRestricted;

                    if (data.gibddRestricted) {
                        car.restrictedArr = data.restrictedArr.slice();

                        // convert ogrkod to string
                        for (var j = 0; j < car.restrictedArr.length; ++j) {
                            car.restrictedArr[j].ogrmsg = $scope.convertOgrcodeToString(car.restrictedArr[j].ogrkod);
                        }
                    }
                }

                car.milleage = kms;
                car.milleageMsg = '' + kms + ' Км';

                if(typeof(data.milleageArr)!=='undefined' && data.milleageArr.length){

                    for (var k = 0; k < data.milleageArr.length; ++k) {
                        var c = data.milleageArr[k];
                        var m0 = parseInt(data.milleageArr[k].milleage, 10);

                        // check for bad/fake milleage
                        if (m0 < 100) {
                            car.badMilleageFound = true;
                        }

                        if (k !== data.milleageArr.length - 1) {
                            var m1 = parseInt(data.milleageArr[k + 1].milleage, 10);

                            if (m0 > m1) {
                                car.fakeMilleageFound = true;
                            }
                        }

                        car.milleageArr.push(c);
                    }
                }

                if (typeof(data.milleageDate) !== 'undefined' && data.milleageDate.length) {
                    car.milleageCheckDate = data.milleageDate;
                }

                // autoNomerPics
                console.log('Parsing autonomer...');
                if (typeof(data.autoNomerPics) !== 'undefined') {
                    car.autoNomerPics = data.autoNomerPics.slice();
                }

                // auctions
                if(typeof(data.auctions)!=='undefined' && data.auctions.length){
                    car.auctions = data.auctions.slice();
                }

                // customs
                if(typeof(data.customs)!=='undefined'){
                    car.customs = data.customs;
                    car.customsFound = true;
                }

                console.log('-->PUSH car: ');
                console.log(car);

                $scope.cars.push(car);
            };

            // START!
            $scope.clearAll();
            if ($location.url().indexOf('admin') !== -1) {
                api.showSpinner(false, 'webSiteLoader');

                $scope.adminEnabled = true;
                try{
                    $window.yaCounter24002680.reachGoal('ADMIN_PAGE');
                }catch(e){
                    console.log('Can not reach goal: ' + e);
                }

                return;
            }else if ($location.url().indexOf('payment') !== -1) {
                console.log('Payment page. Redirect');

                try {
                    if(typeof($window.yaCounter24002680)!=='undefined') {
                        $window.yaCounter24002680.reachGoal('PAYMENT_RECEIVED');
                    }
                }catch(e){
                    console.log('Can not reach goal: ' + e);
                }

                var newUrl = 'engine.html#/success?InvId=' + invId + '&OutSum=' + sum + '&SignatureValue=' + sig;
                $window.location = newUrl;
                return;
            }else {
                // normal processing
                $scope.dataAvailable = true;

                api.getOrderResult(sum, invId, sig, function (err, data) {
                    api.showSpinner(false, 'webSiteLoader');

                    if (err) {
                        $scope.errMessage = 'Произошла ошибка. Обратитесь в техническую поддержку: support@adaperio.ru и укажите следующие данные: ' +
                            'Num= ' + invId + '; Sig= ' + sig;

                        //return $location.path('/result_err');
                        return;
                    }

                    $scope.processData(data);

                    // yandex Analytics
                    if ($scope.numberAsked === 'а254кв199' || $scope.numberAsked === 'а858ое93' || $scope.numberAsked === 'с988мт177') {
                        $window.yaCounter24002680.reachGoal('SAMPLE_SHOWN');
                    }
                });
                return;
            }
        }
    ]
);

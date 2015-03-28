angular.module('adaperio.controllers').controller('controllers.VkSuccessView',
    [
        '$scope',
        '$rootScope',
        '$routeParams',
        '$window',
        '$location',
        'services.Api',

        function($scope,$rootScope,$routeParams,$window,$location,api){
            $scope.receivedLinks = [];

            $scope.milleage   = 0;
            $scope.milleageMsg = 'Не установлен';

            $scope.errMessage = '';
		  $scope.taxiMake   = null;
		  $scope.taxiOwner  = null;

            var num = $location.search().num;
            var userId = $location.search().userId;
            var sid = $location.search().sid;
            var sig   = $location.search().sig;

            api.getDataByFollow(num,userId,sid,sig,function(err,links,kms,taxiData){
                if(err){
                    $scope.errMessage = "Такой пользователь уже вступил/вступал в группу";
                    return;
                }

                $scope.receivedLinks = links.slice();
                if(!$scope.receivedLinks.length && typeof(taxiData)==='undefined'){
                    // add message
                    $scope.errMessage = 'Информация о ДТП не найдена';
                }

			 if(typeof(taxiData)!=='undefined' && taxiData.length){
				$scope.taxiMake  = taxiData[0].name;
				$scope.taxiOwner = taxiData[0].owner;
			 }

                $scope.milleage = kms;
                $scope.milleageMsg = '' + kms + ' КМ (получен при последнем прохождении тех.осмотра)';
            });
        }
    ]
);

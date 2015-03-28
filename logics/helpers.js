
angular.module('adaperio.services').factory('services.Helpers',[
    '$q',

    function($q){
        return {

            // Helper function to extract claims from a JWT. Does *not* verify the
            // validity of the token.
            // credits: https://github.com/firebase/angularFire/blob/master/angularFire.js#L370
            // polyfill window.atob() for IE8: https://github.com/davidchambers/Base64.js
            // or really fast Base64 by Fred Palmer: https://code.google.com/p/javascriptbase64/
            deconstructJWT: function(token) {
                var segments = token.split(".");
                if (!segments instanceof Array || segments.length !== 3) {
                    throw new Error("Invalid JWT");
                }
                var claims = segments[1];
                return JSON.parse(decodeURIComponent(window.atob(claims)));
            },

            // this is how REST works
            convertNumberToUrlCheckCar: function(num){
                num = num.toLowerCase();

                var numEncoded = encodeURIComponent(num);
                return "http://api.adaperio.ru:8080/v1/data_for_cars/" + numEncoded;
            },

            convertNumberToUrlGetCar: function(num){
                num = num.toLowerCase();

                var numEncoded = encodeURIComponent(num);
                return "http://api.adaperio.ru:8080/v1/auth/car_by_num_all/" + numEncoded;
            },

            convertVinToUrlGetCar: function(vin){
                var vinEncoded = encodeURIComponent(vin);
                return "http://api.adaperio.ru:8080/v1/auth/car_by_vin_all/" + vinEncoded;
            },

            convertNumToUrlMakeLink: function(num){
                var numEncoded = encodeURIComponent(num);
                return "http://api.adaperio.ru:8080/v1/auth/create_link/" + numEncoded;
            },

            convertVinToUrlMakeLink: function(vin){
                return "http://api.adaperio.ru:8080/v1/auth/create_link_by_vin/" + vin;
            }
        };
    }]
);

// This service is used to pass data from 'controllers.SearchView' to 'controllers.CheckoutView'
angular.module('adaperio.services').factory('services.ToCheckout',
    function() {
        var number = '';
        var data = '';
        var isFromSearchView = false;

        return {
            setFromSearchView: function(f){
                isFromSearchView = f;
            },

            getFromSearchView: function(){
                return isFromSearchView;
            },

            setSearchData: function(d){
                data = d;
            },

            getSearchData: function(){
                return data;
            }
        };
    }
);




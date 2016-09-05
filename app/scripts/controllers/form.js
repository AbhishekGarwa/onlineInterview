'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('FormCtrl', function($scope, Data, $location) {
    $scope.userAuthenticate = function(customer){
        Data.post('login', {
            customer: customer
        }).then(function (results) {
            if (results.status == "success") {
                $location.path('/dashboard/home');
            }
        });
    }
    $scope.signup = {email:'',password:'',name:'',phone:'',address:''};
    $scope.signUp = function (customer) {
        Data.post('signUp', {
            customer: customer
        }).then(function (results) {
            if (results.status == "success") {
                $location.path('/dashboard/home');
            }
        });
    };
});


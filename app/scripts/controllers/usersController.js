'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:UsersCtrl
 * @description
 * # UsersCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('UsersCtrl', function($scope, Data, $location, $modal, $filter) {
    $scope.userlist = [];
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 5; //max no of items to display in a page    
    $scope.setorderby = false; 
	
    Data.post('mngusers',{limit: $scope.entryLimit}).then(function(data){
      if(data.datares){
        $scope.userlist = data.datares;
        /* Manage Paging */
        $scope.filteredItems = $scope.userlist.length; //Initially for no filter  
        $scope.totalItems = $scope.userlist.length;       
        /* End */
      }
    });
    $scope.usrpagesize = function(){
       Data.put("usrlistpagesize",{limit:$scope.entryLimit}).then(function (result){
             $scope.userlist =result;
        });      
    }
     $scope.user_sort = function(predicate) {
      if($scope.oldpredicate != predicate){
          $scope.setorderby = false;
          $scope.oldpredicate = predicate; 
      }
      if($scope.oldpredicate == predicate){
          $scope.setorderby = !$scope.setorderby;
      }
        Data.post('userlistsorting',{limit: $scope.entryLimit, orderby: predicate, setorderby: $scope.setorderby}).then(function(data){
          if(data.datares){
            $scope.userlist = data.datares;
          }
        });        
     };      
    $scope.usrsrchFilter = function(){
		if($scope.filterUser){
		   Data.put("usrlistfilter",{keyword:$scope.filterUser}).then(function (result){
			 $scope.userlist =result;
			});
		}else{
		   Data.put("usrlistpagesize",{limit:$scope.entryLimit}).then(function (result){
			 $scope.userlist =result;
			});		
		}
    }
    $scope.deleteUser = function(user){
        if(confirm("Are you sure to remove the user")){
            Data.delete("userdelete/"+user.uid).then(function(result){
                $scope.userlist = _.without($scope.userlist, _.findWhere($scope.userlist, {uid:user.uid}));
            });
        }
    }
    $scope.adduser = function(p,size){
        var modalInstance = $modal.open({
          templateUrl: 'views/mngusers/useradd.html',
          controller: 'UsereditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
            if(selectedObject.save == "insert"){
                $scope.userlist.push(selectedObject);
                $scope.userlist = $filter('orderBy')($scope.userlist, 'uid', 'reverse');
            }else if(selectedObject.save == "update"){
                p.name = selectedObject.name;
				p.email = selectedObject.email;
				p.phone = selectedObject.phone;
				p.password = selectedObject.password;
				p.password_dcrpt = selectedObject.password_dcrpt;
				p.address = selectedObject.address;
				p.city = selectedObject.city;
				p.selectedcat = selectedObject.selectedcat;
            }
        });  
    }
}).controller('UsereditCtrl', function($scope, $modalInstance, item, Data) {
	if(item){
		item.password = item.password_dcrpt;
		$scope.user = angular.copy(item);
		Data.post('catlistunserialize/'+item.uid).then(function (result) {
			$scope.user.selectedcat = result['datares'];
	     });
    }else{
        $scope.user = {password:''};    
    }   
   $scope.btndisable=true;
   $scope.showhide=false;
   Data.get('catlistn').then(function (result) {
	$scope.catlist = result.datares;
   });   
    $scope.passwordLength = 12;
    $scope.addUpper       = true;
    $scope.addNumbers     = true;
    $scope.addSymbols        = false;	

    $scope.generatePassword = function(){
        var lowerCharacters = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
        var upperCharacters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        var numbers = ['0','1','2','3','4','5','6','7','8','9'];
        var symbols = ['!', '"', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/', ':', ';', '<', '=', '>', '?', '@', '[', '\\', ']', '^', '_', '`', '{', '|', '}', '~'];
        var finalCharacters = lowerCharacters;
        if($scope.addUpper){
            finalCharacters = finalCharacters.concat(upperCharacters);
        }
        if($scope.addNumbers){
            finalCharacters = finalCharacters.concat(numbers);
        }
        if($scope.addSymbols){
            finalCharacters = finalCharacters.concat(symbols);
        }
        var passwordArray = [];
        for (var i = 1; i < $scope.passwordLength; i++) {
            passwordArray.push(finalCharacters[Math.floor(Math.random() * finalCharacters.length)]);
        };
		$scope.btndisable = false;
		$scope.showhide=true;
	   $scope.password=passwordArray.join("");
    };	
   $scope.usePassword = function(){
	   $scope.btndisable = true;
	   $scope.showhide=false;
	   $scope.user.password=$scope.password;
   };
   $scope.cancel_btn = function () {
       $modalInstance.dismiss('Close');
   };
    $scope.process_user = function(user){
    if(user.uid > 0){
       Data.put('userupdate/'+user.uid, user).then(function (result) {
		   if(result.status != 'error'){
		   var x = angular.copy(user);
		   x.save = 'update';
		   $modalInstance.close(x);
		   }else{
		   console.log(result);
		   }
       });
    }else{
       Data.post('user', {
            user: user
       }).then(function (results) {
            if(results.status != 'error'){
               user.uid = results.uid;
               user.save = 'insert';
               var x = angular.copy(user);
               $modalInstance.close(x);
            }else{
               console.log(results);
            }            
        });
     }
    } 
});
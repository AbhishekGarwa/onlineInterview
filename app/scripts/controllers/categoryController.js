'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:CategoryCtrl
 * @description
 * # CategoryCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('CategoryCtrl', function($scope, Data, $location, $modal, $filter) {
    $scope.categorylist = [];
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 5; //max no of items to display in a page    
    $scope.setorderby = false; 
    Data.post('mngcategories',{limit: $scope.entryLimit}).then(function(data){
      if(data.datares){
        $scope.categorylist = data.datares;
        /* Manage Paging */
        $scope.filteredItems = $scope.categorylist.length; //Initially for no filter  
        $scope.totalItems = $scope.categorylist.length;       
        /* End */
      }
    });
    $scope.catpagesize = function(){
       Data.put("catlistpagesize",{limit:$scope.entryLimit}).then(function (result){
             $scope.categorylist =result;
        });      
    }
	/*
    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function() {
        $timeout(function() { 
            $scope.filteredItems = $scope.filtered.length;
         }, 10);
     }; 
	 */
     $scope.category_sort = function(predicate) {
      if($scope.oldpredicate != predicate){
          $scope.setorderby = false;
          $scope.oldpredicate = predicate; 
      }
      if($scope.oldpredicate == predicate){
          $scope.setorderby = !$scope.setorderby;
      }
        Data.post('categorylistsorting',{limit: $scope.entryLimit, orderby: predicate, setorderby: $scope.setorderby}).then(function(data){
          if(data.datares){
            $scope.categorylist = data.datares;
          }
        });        
     };      
    $scope.catsrchFilter = function(){
		if($scope.filterCategory){
		   Data.put("catlistfilter",{keyword:$scope.filterCategory}).then(function (result){
			 $scope.categorylist =result;
			});
		}else{
		   Data.put("catlistpagesize",{limit:$scope.entryLimit}).then(function (result){
			 $scope.categorylist =result;
			});		
		}
    }
    $scope.deleteCategory = function(category){
        if(confirm("Are you sure to remove the category")){
            Data.delete("categorydelete/"+category.cid).then(function(result){
				console.log(result);
                $scope.categorylist = _.without($scope.categorylist, _.findWhere($scope.categorylist, {cid:category.cid}));
            });
        }
    }
    $scope.addcategory = function(p,size){
        var modalInstance = $modal.open({
          templateUrl: 'views/mngcategory/categoryadd.html',
          controller: 'CategoryeditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
            if(selectedObject.save == "insert"){
                $scope.categorylist.push(selectedObject);
                $scope.categorylist = $filter('orderBy')($scope.categorylist, 'cid', 'reverse');
            }else if(selectedObject.save == "update"){
                p.title = selectedObject.title;
            }
        });  
    }
}).controller('CategoryeditCtrl', function($scope, $modalInstance, item, Data) {
	$scope.category = angular.copy(item);
   $scope.cancel_btn = function () {
       $modalInstance.dismiss('Close');
   };
    $scope.process_category = function(category){
		console.log(category);
    if(category.cid > 0){
       Data.put('categoryupdate/'+category.cid, category).then(function (result) {
		   console.log(result);
		   if(result.status != 'error'){
		   var x = angular.copy(category);
		   x.save = 'update';
		   $modalInstance.close(x);
		   }else{
		   console.log(result);
		   }
       });
    }else{
       Data.post('category', {
            category: category
       }).then(function (results) {
            if(results.status != 'error'){
               category.cid = results.cid;
               category.save = 'insert';
               var x = angular.copy(category);
               $modalInstance.close(x);
            }else{
               console.log(results);
            }            
        });
     }
    } 
});
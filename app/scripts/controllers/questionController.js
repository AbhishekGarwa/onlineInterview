'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:QuestionCtrl
 * @description
 * # QuestionCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('QuestionCtrl', function($scope, Data, $location, $modal, $filter) {
    $scope.ques = {};
    $scope.questionlist = [];
    $scope.currentPage = 1; //current page
    $scope.entryLimit = 5; //max no of items to display in a page    
    $scope.setorderby = false; 
    Data.post('queslist',{limit: $scope.entryLimit}).then(function(data){
      if(data.datares){
        $scope.questionlist = data.datares;
        /* Manage Paging */
        $scope.filteredItems = $scope.questionlist.length; //Initially for no filter  
        $scope.totalItems = $scope.questionlist.length;       
        /* End */
      }
    });
    $scope.pagesize = function(){
       Data.put("queslistpagesize",{limit:$scope.entryLimit}).then(function (result){
             $scope.questionlist =result;
        });      
    }
    $scope.setPage = function(pageNo) {
        $scope.currentPage = pageNo;
    };
    $scope.filter = function() {
        $timeout(function() { 
            $scope.filteredItems = $scope.filtered.length;
         }, 10);
     }; 
     $scope.sort_by = function(predicate) {
      if($scope.oldpredicate != predicate){
          $scope.setorderby = false;
          $scope.oldpredicate = predicate; 
      }
      if($scope.oldpredicate == predicate){
          $scope.setorderby = !$scope.setorderby;
      }
        Data.post('queslistsorting',{limit: $scope.entryLimit, orderby: predicate, setorderby: $scope.setorderby}).then(function(data){
          if(data.datares){
            $scope.questionlist = data.datares;
          }
        });        
     };      
    $scope.quessrchFilter = function(){
		if($scope.filterQuestion){
		   Data.put("queslistfilter",{keyword:$scope.filterQuestion}).then(function (result){
			 $scope.questionlist =result;
			});
		}else{
		   Data.put("queslistpagesize",{limit:$scope.entryLimit}).then(function (result){
			 $scope.questionlist =result;
			});		
		}
    }
    $scope.deleteQuestion = function(question){
        if(confirm("Are you sure to remove the question and there options")){
            Data.delete("queslist/"+question.qid).then(function(result){
                $scope.questionlist = _.without($scope.questionlist, _.findWhere($scope.questionlist, {qid:question.qid}));
            });
        }
    }
    $scope.changeQuestionStatus = function(question){
        question.actions = (question.actions=="Active" ? "Inactive" : "Active");
        Data.put("queslist/"+question.qid,{actions:question.actions});
    }
    $scope.optionslist = function(o,size){
        var modalInstance = $modal.open({
          templateUrl: 'views/question_ans/optionslist.html',
          controller: 'QuestionsoptionCtrl',
          size: size,
          resolve: {
            item: function () {
              return o;
            }
          }
          });
    }
    $scope.addques = function(p,size){
        var modalInstance = $modal.open({
          templateUrl: 'views/question_ans/quesadd.html',
          controller: 'QuestioneditCtrl',
          size: size,
          resolve: {
            item: function () {
              return p;
            }
          }
        });
        modalInstance.result.then(function(selectedObject) {
            if(selectedObject.save == "insert"){
                $scope.questionlist.push(selectedObject);
                $scope.questionlist = $filter('orderBy')($scope.questionlist, 'qid', 'reverse');
            }else if(selectedObject.save == "update"){
                p.title = selectedObject.title;
                p.quesdesc = selectedObject.quesdesc;
                p.optiontype = selectedObject.optiontype;
                p.actions = selectedObject.actions;
				p.selectedcat = selectedObject.selectedcat;
            }
        });  
    }
}).controller('QuestioneditCtrl', function($scope, $modalInstance, item, Data) {
	$scope.status_del = 0; //1 for deleted records and 0 for active records    
    if(item){
        $scope.ques = angular.copy(item);
		console.log($scope.ques);
    }else{
        $scope.ques = { optiontype: 'H' };    
    }
    Data.get('catlist').then(function (result) {
		$scope.catlist = result.datares;
    });
   $scope.cancel_btn = function () {
            $modalInstance.dismiss('Close');
        };
    $scope.process_question = function(ques){
        if(ques.title != '' && ques.quesdesc != ''){
            if(ques.qid > 0){
                Data.put('queslist/'+ques.qid, ques).then(function (result) {
                    if(result.status != 'error'){
                        var x = angular.copy(ques);
                        x.save = 'update';
                        $modalInstance.close(x);
                    }else{
                        console.log(result);
                    }
                });
            }else{
                ques.actions = 'Active';
                Data.post('ques', {
                    ques: ques
                }).then(function (results) {
                   if(results.status != 'error'){
                    ques.qid = results.qid;
                    ques.save = 'insert';
					ques.cattitle = results.datares.cattitle;
                    var x = angular.copy(ques);
                    $modalInstance.close(x);
                    }else{
                       console.log(results);
                    }            
                });                
            }
       }     
    } 
}).controller('QuestionsoptionCtrl', function($scope, $modalInstance, item, Data) {
   $scope.option_details = angular.copy(item);
   $scope.optionlist = [];
    Data.put('optionlist/'+item.qid, item).then(function(data){
      if(data.option_data){
        $scope.optionlist = data.option_data;
      }
    });
    $scope.cancel_btn = function () {
        $modalInstance.dismiss('Close');
    };        
    $scope.addoption = function(addop,option_details){
        $scope.addop.ans_status=($scope.addop.ans_status)?'Y':'N';
         Data.post('addop', {
              addop: addop,
              option_details: option_details
         }).then(function (results) {
             var y= angular.copy(addop);
             y.oid = results.oid;
             if($scope.optionlist){
                $scope.optionlist.push(y);   
             }else{
                $scope.optionlist = { '0':{'newoption':addop.newoption, 'ans_status':addop.ans_status, 'oid':results.oid, 'qid':results.datares.qid} };
             }
             $scope.addop.newoption = '';
             $scope.addop.ans_status = false;
         }); 
    }
});
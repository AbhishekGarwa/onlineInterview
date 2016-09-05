<?php 
$app->get('/catlist', function() use ($app) {
    $db = new DbHandler();
    $records = $db->getAllRecord("select cid, title from tbl_categories where status_del = 0 order by title ASC");
    $response["datares"] = $records;
    echoResponse(200, $response); 
});
$app->post('/queslist', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $db = new DbHandler();
	$user = $db->getAllRecord("SELECT tq.qid, tq.title, tq.quesdesc, tq.optiontype, tq.actions, tc.title as cattitle, tq.selectedcat as selectedcat FROM tbl_questions AS tq LEFT JOIN tbl_categories AS tc ON ( tq.selectedcat = tc.cid ) order by tq.qid desc LIMIT $r->limit");	
    $response["status"] = "success";
    $response["message"] = "Question created successfully";
    $response["datares"] = $user;
    echoResponse(200, $response); 
});
$app->post('/queslistsorting', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $ordby = 'DESC';
    if($r->setorderby == 1){
       $ordby = 'ASC';
    }
    $db = new DbHandler();
    $user = $db->getAllRecord("SELECT tq.qid, tq.title, tq.quesdesc, tq.optiontype, tq.actions, tc.title as cattitle, tq.selectedcat as selectedcat FROM tbl_questions AS tq LEFT JOIN tbl_categories AS tc ON ( tq.selectedcat = tc.cid ) order by tq.$r->orderby $ordby LIMIT $r->limit");
    $response["status"] = "success";
    $response["message"] = "Question created successfully";
    $response["datares"] = $user;
    echoResponse(200, $response); 
});
$app->post('/ques', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $db = new DbHandler();
    $tabble_name = "tbl_questions";
    $column_names = array('title', 'quesdesc', 'optiontype', 'selectedcat');
    $result = $db->insertIntoTable($r->ques, $column_names, $tabble_name);
    if ($result != NULL) {
        $response["status"] = "success";
        $response["message"] = "Question created successfully";
        $insertedRow = $db->getOneRecord("SELECT tq.qid, tq.title, tq.quesdesc, tq.optiontype, tq.actions, tc.title as cattitle, tq.selectedcat as selectedcat FROM tbl_questions AS tq LEFT JOIN tbl_categories AS tc ON ( tq.selectedcat = tc.cid ) where tq.qid = $result");
        $response["qid"] = $result;
        $response["datares"] = $insertedRow;
        echoResponse(200, $response);
    } else {
        $response["status"] = "error";
        $response["message"] = "Failed to create question. Please try again";
        echoResponse(201, $response);
    }           
});
$app->delete('/queslist/:id', function($id) { 
    $db = new DbHandler();
    $rowsoptions = $db->delete("tbl_options", array('qid'=>$id));
    if($rowsoptions["status"]=="success"){
    $rows = $db->delete("tbl_questions", array('qid'=>$id));
    if($rows["status"]=="success")
        $rows["message"] = "Question removed successfully.";
    }
    echoResponse(200, $rows);
});
$app->put('/queslist/:id', function($id) use ($app){
    $data = json_decode($app->request->getBody());
	unset($data->cattitle);
    $db = new DbHandler();
    $rows = $db->update("tbl_questions", $data, array('qid'=>$id));
    if($rows["status"]=="success")
    $rows["message"] = "Status successfully changed.";
    echoResponse(200, $rows);
});
$app->put('/queslistfilter', function() use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->getAllRecord("SELECT tq.qid, tq.title, tq.quesdesc, tq.optiontype, tq.actions, tc.title as cattitle, tq.selectedcat as selectedcat FROM tbl_questions AS tq LEFT JOIN tbl_categories AS tc ON ( tq.selectedcat = tc.cid ) where tq.title LIKE '%$data->keyword%'");
	echoResponse(200, $rows);
});
$app->put('/queslistpagesize', function() use ($app){
    $data = json_decode($app->request->getBody());
    $db = new DbHandler();
    $rows = $db->getAllRecord("SELECT tq.qid, tq.title, tq.quesdesc, tq.optiontype, tq.actions, tc.title as cattitle, tq.selectedcat as selectedcat FROM tbl_questions AS tq LEFT JOIN tbl_categories AS tc ON ( tq.selectedcat = tc.cid ) LIMIT $data->limit");
    echoResponse(200, $rows);
});
/* M
/* Manage Options */
$app->post('/addop', function() use ($app) {
    $r = json_decode($app->request->getBody());
    $r->addop->qid = $r->option_details->qid;
    $db = new DbHandler();
    $tabble_name = "tbl_options";
    $column_names = array('newoption', 'ans_status', 'qid');
    $result = $db->insertIntoTable($r->addop, $column_names, $tabble_name);
    if ($result != NULL) {
        $response["status"] = "success";
        $response["message"] = "Question created successfully";
        $insertedRow = $db->getOneRecord("select oid, newoption, ans_status, qid from tbl_options where oid = $result");
        $response["oid"] = $result;
        $response["datares"] = $insertedRow;
        echoResponse(200, $response);
    } else {
        $response["status"] = "error";
        $response["message"] = "Failed to create question. Please try again";
        echoResponse(201, $response);
    } 
});
$app->put('/optionlist/:id', function($id) use ($app) {
    $db = new DbHandler();
    $rows = $db->getAllRecord("select oid, newoption, ans_status, qid from tbl_options where qid = $id order by oid desc");
    $response["option_data"] = $rows;
    echoResponse(200, $response); 
});
?>